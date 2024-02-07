package fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.actrep

typealias FaoZones = List<String>
typealias FaoZonesAndSpecy = Pair<FaoZones, String>

/**
 * The following fao areas and species are defined in the species table document of each JDP.
 *
 * These tables could be found in these file names :
 * - "Liste Espèces_JDP MED.pdf"
 * - "liste espèces JDP NS-01.odt"
 * - "LISTE_ESPECES_JDP WW.odt"
 * * See issue: https://github.com/MTES-MCT/monitorfish/issues/1750
 */

val MED_FAO_CODES = listOf("37.1", "37.2", "37.3")
val MEDITERRANEAN_AND_EASTERN_ATLANTIC_SPECIES: List<FaoZonesAndSpecy> = generateSpeciesWithFaoCode(
    MED_FAO_CODES,
    listOf(
        "ANE",
        "HOM",
        "JAX",
        "HMM",
        "JAA",
        "SWO",
        "ALB",
        "MAC",
        "MAZ",
        "PIL",
        "BFT",
        "ELE",
        "BSS",
        "WRF",
        "SIA",
        "COL",
        "DOX",
        "DPS",
        "ARA",
        "SBR",
        "SBG",
        "ARS",
        "LBS",
        "VLO",
        "LOX",
        "NEP",
        "SSB",
        "GPX",
        "HKE",
        "SBA",
        "PAC",
        "RPG",
        "VEN",
        "PTS",
        "CLH",
        "MUX",
        "MUM",
        "MUR",
        "MUT",
        "SHR",
        "CTB",
        "SWA",
        "SOL",
        "ANN",
    ),
) +
    // Eastern Atlantic part
    listOf(Pair(listOf("27.7", "27.8", "27.9", "27.10"), "BFT"))

val NS_01_FAO_CODES = listOf("27.4", "27.3.a")
val NORTH_SEA_SPECIES: List<FaoZonesAndSpecy> = generateSpeciesWithFaoCode(
    NS_01_FAO_CODES,
    listOf(
        "HOM",
        "JAX",
        "ALB",
        "ARU",
        "ARY",
        "HER",
        "SAN",
        "MAC",
        "WHB",
        "SPR",
        "BET",
        "ELE",
        "ANF",
        "MNZ",
        "USK",
        "COD",
        "LEZ",
        "PRA",
        "SBR",
        "HAD",
        "GHL",
        "GRV",
        "NEP",
        "POL",
        "POK",
        "LEM",
        "BLI",
        "LIN",
        "WHG",
        "HKE",
        "PLE",
        "WIT",
        "SRX",
        "BSF",
        "SCF",
        "BLL",
        "SOL",
        "NOP",
    ),
)

val WW_01_FAO_CODES = listOf("27.6", "27.7", "27.8", "27.9", "27.10")
val WESTERN_WATERS_SPECIES: List<FaoZonesAndSpecy> = listOf(
    Pair(listOf("27.6", "27.7", "27.8", "27.9"), "PIL"),
    Pair(listOf("27.6", "27.7", "27.8", "27.9"), "ELE"),
) + generateSpeciesWithFaoCode(
    WW_01_FAO_CODES,
    listOf(
        "ANE",
        "HOM",
        "JAX",
        "ALB",
        "ARU",
        "ARY",
        "HER",
        "MAC",
        "WHB",
        "SPR",
        "OTH",
        "BET",
        "ANF",
        "MNZ",
        "USK",
        "COD",
        "LEZ",
        "SBR",
        "HAD",
        "GHL",
        "GRV",
        "NEP",
        "POL",
        "POK",
        "BLI",
        "LIN",
        "WHG",
        "HKE",
        "PLE",
        "SRX",
        "BSF",
        "BOR",
        "SOL",
    ),
)

fun generateSpeciesWithFaoCode(faoZones: FaoZones, species: List<String>): List<FaoZonesAndSpecy> {
    return species.map { Pair(faoZones, it) }
}
