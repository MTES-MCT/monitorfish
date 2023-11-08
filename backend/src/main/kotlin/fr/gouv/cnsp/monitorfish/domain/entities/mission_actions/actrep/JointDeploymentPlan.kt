package fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.actrep

enum class JointDeploymentPlan(private val species: List<FaoCodesAndSpecy>) {
    MEDITERRANEAN_AND_EASTERN_ATLANTIC(MEDITERRANEAN_AND_EASTERN_ATLANTIC_SPECIES),
    NORTH_SEA(NORTH_SEA_SPECIES),
    WESTERN_WATERS(WESTERN_WATERS_SPECIES),
    ;

    fun getSpeciesCodes(): List<FaoCodesAndSpecy> {
        return this.species
    }

    fun isLandControlApplicable(speciesOnboardCodes: List<String>, tripFaoCodes: List<String>): Boolean {
        return this.species.any { (jdpFaoCodes, jdpSpecy) ->
            val isSpecyFound = speciesOnboardCodes.contains(jdpSpecy)
            val isFaoCodeFound = jdpFaoCodes
                .any { jdpFaoCode ->
                    // The JDP FAO code is included in at least one trip FAO code
                    tripFaoCodes.any { tripFaoCode -> tripFaoCode.contains(jdpFaoCode) }
                }

            return@any isSpecyFound && isFaoCodeFound
        }
    }
}
