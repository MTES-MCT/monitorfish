package fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.actrep

enum class JointDeploymentPlan(private val species: List<FaoCodesAndSpecy>) {
    MEDITERRANEAN_AND_EASTERN_ATLANTIC(MEDITERRANEAN_AND_EASTERN_ATLANTIC_SPECIES),
    NORTH_SEA(NORTH_SEA_SPECIES),
    WESTERN_WATERS(WESTERN_WATERS_SPECIES),
    ;

    fun getSpeciesCodes(): List<FaoCodesAndSpecy>{
        return this.species
    }

    fun isLandControlConcerned(speciesOnboardCodes: List<String>, tripFaoCodes: List<String>): Boolean {
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

typealias FaoCodes = List<String>
typealias FaoCodesAndSpecy = Pair<FaoCodes, String>

/**
 * The following fao areas and species are defined in the species table document of each JDP.
 */

val MED_FAO_CODES = listOf("37.1", "37.2", "37.3")
val MEDITERRANEAN_AND_EASTERN_ATLANTIC_SPECIES: List<FaoCodesAndSpecy> = listOf(
    Pair(MED_FAO_CODES, "ANE"),
    Pair(MED_FAO_CODES, "HOM"),
    Pair(MED_FAO_CODES, "JAX"),
    Pair(MED_FAO_CODES, "HMM"),
    Pair(MED_FAO_CODES, "JAA"),
    Pair(MED_FAO_CODES, "SWO"),
    Pair(MED_FAO_CODES, "ALB"),
    Pair(MED_FAO_CODES, "MAC"),
    Pair(MED_FAO_CODES, "MAZ"),
    Pair(MED_FAO_CODES, "PIL"),
    Pair(MED_FAO_CODES, "BFT"),
    Pair(MED_FAO_CODES, "ELE"),
    Pair(MED_FAO_CODES, "BSS"),
    Pair(MED_FAO_CODES, "WRF"),
    Pair(MED_FAO_CODES, "SIA"),
    Pair(MED_FAO_CODES, "COL"),
    Pair(MED_FAO_CODES, "DOX"),
    Pair(MED_FAO_CODES, "DPS"),
    Pair(MED_FAO_CODES, "ARA"),
    Pair(MED_FAO_CODES, "SBR"),
    Pair(MED_FAO_CODES, "SBG"),
    Pair(MED_FAO_CODES, "ARS"),
    Pair(MED_FAO_CODES, "LBS"),
    Pair(MED_FAO_CODES, "VLO"),
    Pair(MED_FAO_CODES, "LOX"),
    Pair(MED_FAO_CODES, "NEP"),
    Pair(MED_FAO_CODES, "SSB"),
    Pair(MED_FAO_CODES, "GPX"),
    Pair(MED_FAO_CODES, "HKE"),
    Pair(MED_FAO_CODES, "SBA"),
    Pair(MED_FAO_CODES, "PAC"),
    Pair(MED_FAO_CODES, "RPG"),
    Pair(MED_FAO_CODES, "VEN"),
    Pair(MED_FAO_CODES, "PTS"),
    Pair(MED_FAO_CODES, "CLH"),
    Pair(MED_FAO_CODES, "MUX"),
    Pair(MED_FAO_CODES, "MUM"),
    Pair(MED_FAO_CODES, "MUR"),
    Pair(MED_FAO_CODES, "MUT"),
    Pair(MED_FAO_CODES, "SHR"),
    Pair(MED_FAO_CODES, "CTB"),
    Pair(MED_FAO_CODES, "SWA"),
    Pair(MED_FAO_CODES, "SOL"),
    Pair(MED_FAO_CODES, "ANN"),
    // Eastern Atlantic part
    Pair(listOf("27.7", "27.8", "27.9", "27.10"), "BFT"),
)

val NS_01_FAO_CODES = listOf("27.4", "27.3.a")
val NORTH_SEA_SPECIES = listOf(
    Pair(NS_01_FAO_CODES, "HOM"),
    Pair(NS_01_FAO_CODES, "JAX"),
    Pair(NS_01_FAO_CODES, "ALB"),
    Pair(NS_01_FAO_CODES, "ARU"),
    Pair(NS_01_FAO_CODES, "ARY"),
    Pair(NS_01_FAO_CODES, "HER"),
    Pair(NS_01_FAO_CODES, "SAN"),
    Pair(NS_01_FAO_CODES, "MAC"),
    Pair(NS_01_FAO_CODES, "WHB"),
    Pair(NS_01_FAO_CODES, "SPR"),
    Pair(NS_01_FAO_CODES, "BET"),
    Pair(NS_01_FAO_CODES, "ELE"),
    Pair(NS_01_FAO_CODES, "ANF"),
    Pair(NS_01_FAO_CODES, "MNZ"),
    Pair(NS_01_FAO_CODES, "USK"),
    Pair(NS_01_FAO_CODES, "COD"),
    Pair(NS_01_FAO_CODES, "LEZ"),
    Pair(NS_01_FAO_CODES, "PRA"),
    Pair(NS_01_FAO_CODES, "SBR"),
    Pair(NS_01_FAO_CODES, "HAD"),
    Pair(NS_01_FAO_CODES, "GHL"),
    Pair(NS_01_FAO_CODES, "GRV"),
    Pair(NS_01_FAO_CODES, "NEP"),
    Pair(NS_01_FAO_CODES, "POL"),
    Pair(NS_01_FAO_CODES, "POK"),
    Pair(NS_01_FAO_CODES, "LEM"),
    Pair(NS_01_FAO_CODES, "BLI"),
    Pair(NS_01_FAO_CODES, "LIN"),
    Pair(NS_01_FAO_CODES, "WHG"),
    Pair(NS_01_FAO_CODES, "HKE"),
    Pair(NS_01_FAO_CODES, "PLE"),
    Pair(NS_01_FAO_CODES, "WIT"),
    Pair(NS_01_FAO_CODES, "SRX"),
    Pair(NS_01_FAO_CODES, "BSF"),
    Pair(NS_01_FAO_CODES, "SCF"),
    Pair(NS_01_FAO_CODES, "BLL"),
    Pair(NS_01_FAO_CODES, "SOL"),
    Pair(NS_01_FAO_CODES, "NOP"),
    )

val WW_01_FAO_CODES = listOf("27.6", "27.7", "27.8", "27.9", "27.10")
val WESTERN_WATERS_SPECIES = listOf(
    Pair(listOf("27.6", "27.7", "27.8", "27.9"), "PIL"),
    Pair(listOf("27.6", "27.7", "27.8", "27.9"), "ELE"),
    Pair(WW_01_FAO_CODES, "ANE"),
    Pair(WW_01_FAO_CODES, "HOM"),
    Pair(WW_01_FAO_CODES, "JAX"),
    Pair(WW_01_FAO_CODES, "ALB"),
    Pair(WW_01_FAO_CODES, "ARU"),
    Pair(WW_01_FAO_CODES, "ARY"),
    Pair(WW_01_FAO_CODES, "HER"),
    Pair(WW_01_FAO_CODES, "MAC"),
    Pair(WW_01_FAO_CODES, "WHB"),
    Pair(WW_01_FAO_CODES, "SPR"),
    Pair(WW_01_FAO_CODES, "OTH"),
    Pair(WW_01_FAO_CODES, "BET"),
    Pair(WW_01_FAO_CODES, "ANF"),
    Pair(WW_01_FAO_CODES, "MNZ"),
    Pair(WW_01_FAO_CODES, "USK"),
    Pair(WW_01_FAO_CODES, "COD"),
    Pair(WW_01_FAO_CODES, "LEZ"),
    Pair(WW_01_FAO_CODES, "SBR"),
    Pair(WW_01_FAO_CODES, "HAD"),
    Pair(WW_01_FAO_CODES, "GHL"),
    Pair(WW_01_FAO_CODES, "GRV"),
    Pair(WW_01_FAO_CODES, "NEP"),
    Pair(WW_01_FAO_CODES, "POL"),
    Pair(WW_01_FAO_CODES, "POK"),
    Pair(WW_01_FAO_CODES, "BLI"),
    Pair(WW_01_FAO_CODES, "LIN"),
    Pair(WW_01_FAO_CODES, "WHG"),
    Pair(WW_01_FAO_CODES, "HKE"),
    Pair(WW_01_FAO_CODES, "PLE"),
    Pair(WW_01_FAO_CODES, "SRX"),
    Pair(WW_01_FAO_CODES, "BSF"),
    Pair(WW_01_FAO_CODES, "BOR"),
    Pair(WW_01_FAO_CODES, "SOL"),
)


