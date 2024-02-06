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

    fun isLandControlApplicable(speciesOnboardCodes: List<String>, tripFaoCodes: List<String>): Boolean {
        return this.species.any { (jdpFaoZones, jdpSpecy) ->
            val isSpecyFound = speciesOnboardCodes.contains(jdpSpecy)

            val isFaoZoneFound = jdpFaoZones
                .any { jdpFaoCode ->
                    // The JDP FAO zone is included in at least one trip FAO code
                    tripFaoCodes.any { tripFaoCode -> tripFaoCode.contains(jdpFaoCode) }
                }

            return@any isSpecyFound && isFaoZoneFound
        }
    }
}
