package fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.actrep

enum class JointDeploymentPlan(private val species: List<FaoZonesAndSpecy>) {
    MEDITERRANEAN_AND_EASTERN_ATLANTIC(MEDITERRANEAN_AND_EASTERN_ATLANTIC_SPECIES),
    NORTH_SEA(NORTH_SEA_SPECIES),
    WESTERN_WATERS(WESTERN_WATERS_SPECIES),
    ;

    fun getFaoZonesAndSpeciesCodes(): List<FaoZonesAndSpecy> {
        return this.species
    }

    fun getSpeciesCodes(): List<String> {
        return this.species.map { it.second }.distinct()
    }

    /**
     * See "DÉCISION D’EXÉCUTION (UE) 2023/2376 DE LA COMMISSION":
     *  https://extranet.legipeche.metier.developpement-durable.gouv.fr/fichier/pdf/oj_l_202302376_fr_txt_cle6b198e.pdf?arg=24774&cle=7d14626b709ff7e8c62586bcd8683e7e9fcaa348&file=pdf%2Foj_l_202302376_fr_txt_cle6b198e.pdf
     */
    fun isLandControlApplicable(flagState: String?, speciesOnboardCodes: List<String>, tripFaoCodes: List<String>): Boolean {
        val isThirdCountryVessel = EU_THIRD_COUNTRIES.contains(flagState)

        val hasSpeciesInJdp = this.species.any { (jdpFaoZones, jdpSpecy) ->
            val isSpecyFoundInJdpSPecies = speciesOnboardCodes.contains(jdpSpecy)

            val isFaoZoneFoundInJdpFaoZones = jdpFaoZones
                .any { jdpFaoCode ->
                    // The JDP FAO zone is included in at least one trip FAO code
                    tripFaoCodes.any { tripFaoCode -> tripFaoCode.contains(jdpFaoCode) }
                }

            return@any isSpecyFoundInJdpSPecies && isFaoZoneFoundInJdpFaoZones
        }

        val hasSpeciesInEUQuotas = if (isThirdCountryVessel) {
            EU_QUOTAS_SPECIES.any { quotaSpecy -> speciesOnboardCodes.contains(quotaSpecy) }
        } else {
            false
        }

        return hasSpeciesInJdp || hasSpeciesInEUQuotas
    }
}
