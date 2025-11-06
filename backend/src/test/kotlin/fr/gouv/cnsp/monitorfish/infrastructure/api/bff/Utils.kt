package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.AdministrativeAreaSpecification
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.AdministrativeAreaType
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.GearMeshSizeEqualityComparator
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.GearSpecification
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PositionAlertSpecification
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.RegulatoryAreaSpecification
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SpeciesSpecification
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SpecyWeightEqualityComparator
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_profile.VesselProfile
import kotlinx.coroutines.runBlocking
import org.mockito.BDDMockito
import java.time.ZonedDateTime

fun <T> givenSuspended(block: suspend () -> T) = BDDMockito.given(runBlocking { block() })!!

object TestUtils {
    val DUMMY_POSITION_ALERT =
        PositionAlertSpecification(
            id = 1,
            name = "Chalutage dans les 3 milles",
            description =
                """
                _Sur les 8 dernières heures_\n\nPour tous les navires en
                pêche dans la zone des 3 milles ayant déclaré un chalut dans un FAR de leur
                marée, ou n'ayant pas encore fait de FAR.
                """.trimIndent(),
            isUserDefined = false,
            natinfCode = 7059,
            isActivated = true,
            isInError = false,
            isDeleted = false,
            errorReason = null,
            validityStartDatetimeUtc = null,
            hasAutomaticArchiving = true,
            validityEndDatetimeUtc = null,
            repeatEachYear = false,
            trackAnalysisDepth = 8.0,
            onlyFishingPositions = true,
            gears =
                listOf(
                    GearSpecification("OTB", null, null, meshType = null),
                    GearSpecification("OTM", 80.0, 120.0, meshType = GearMeshSizeEqualityComparator.BETWEEN),
                    GearSpecification("PTB", null, null, meshType = null),
                ),
            species =
                listOf(
                    SpeciesSpecification("HKE", 500.0, SpecyWeightEqualityComparator.EQUAL),
                    SpeciesSpecification("SOL", null, null),
                ),
            speciesCatchAreas = listOf("27.7.e", "27.8.a"),
            administrativeAreas =
                listOf(
                    AdministrativeAreaSpecification(
                        areas = listOf("0-3"),
                        areaType = AdministrativeAreaType.DISTANCE_TO_SHORE,
                    ),
                ),
            regulatoryAreas =
                listOf(
                    RegulatoryAreaSpecification(
                        lawType = "Reg. RTC",
                        topic = null,
                        zone = null,
                    ),
                ),
            minDepth = null,
            flagStatesIso2 = listOf("FR", "ES"),
            vesselIds = listOf(1, 2, 3),
            districtCodes = listOf("CC", "BR"),
            producerOrganizations = listOf("SA THO AN"),
            createdBy = "user@example.gouv.fr",
            createdAtUtc = ZonedDateTime.now(),
        )

    val DUMMY_VESSEL_PROFILE =
        VesselProfile(
            cfr = "BEL010331976",
            gears = mapOf("TBB" to 1.0),
            species =
                mapOf(
                    "ANF" to 0.15138120208784955,
                    "BIB" to 0.013077050861113404,
                    "BLL" to 0.012793634784147927,
                    "BSS" to 0.002056499349117956,
                    "COD" to 0.0006238048025657802,
                    "COE" to 0.0029704990598370482,
                    "CRE" to 0.011927696224884148,
                    "CTC" to 0.19346327210220773,
                    "DAB" to 0.0017120357081406986,
                    "GUU" to 0.03968282077372057,
                    "HAD" to 0.0034843953971888577,
                    "HKE" to 0.00589701188359574,
                    "JOD" to 0.002179508476852234,
                    "LBE" to 0.00022849992767977293,
                    "LEM" to 0.020073718646668053,
                    "LEZ" to 0.08023203710656027,
                    "LIN" to 0.000607809807628196,
                    "MUR" to 0.007921330826232129,
                    "NEP" to 0.004684248517435345,
                    "OCC" to 0.027800824534372374,
                    "OCZ" to 0.01043483003070963,
                    "PLE" to 0.041766930530766494,
                    "POL" to 0.00062380480256578,
                    "RJC" to 0.049736817591630574,
                    "RJH" to 0.0336085310295666,
                    "RJM" to 0.007616664255992431,
                    "RJU" to 0.005902914798394134,
                    "SCE" to 0.04170123680155856,
                    "SOL" to 0.14552672927412355,
                    "SOS" to 0.003338955193220682,
                    "SQC" to 0.023630700854216518,
                    "SYC" to 0.025154033705415003,
                    "TUR" to 0.007056839433176987,
                    "WEG" to 0.0016566244756783537,
                    "WHE" to 0.006950206133593094,
                    "WHG" to 0.003595065528828428,
                    "WIT" to 0.008901214682765555,
                ),
            faoAreas =
                mapOf(
                    "27.4.c" to 0.002681065818109335,
                    "27.7.a" to 0.04021503518860803,
                    "27.7.d" to 0.3395116667112242,
                    "27.7.e" to 0.21021422096719908,
                    "27.7.f" to 0.14126189237394435,
                    "27.7.g" to 0.1674293232586192,
                    "27.7.h" to 0.0986867956822958,
                ),
            segments =
                mapOf(
                    "NS09" to 0.002681065818109335,
                    "NWW05" to 0.9973189341818907,
                ),
            landingPorts =
                mapOf(
                    "FRLEH" to 0.5528327980049045,
                    "FRROS" to 0.4471672019950954,
                ),
            recentGears = mapOf("TBB" to 1.0),
            recentSpecies =
                mapOf(
                    "ANF" to 0.15513496742165686,
                    "BIB" to 0.061019753852518364,
                    "GUU" to 0.015513496742165686,
                    "HAD" to 0.018150791188333855,
                    "JOD" to 0.006101975385251837,
                    "LEM" to 0.11945392491467578,
                    "LEZ" to 0.05481435515565209,
                    "MUR" to 0.021512048815803087,
                    "OCZ" to 0.02068466232288758,
                    "PLE" to 0.04886751473782191,
                    "RJH" to 0.015513496742165686,
                    "RJM" to 0.015513496742165686,
                    "SCE" to 0.04136932464577516,
                    "SOL" to 0.3226807322370463,
                    "SYC" to 0.07239631813010654,
                    "TUR" to 0.011273140965973732,
                ),
            recentFaoAreas = mapOf("27.7.f" to 1.0),
            recentSegments = mapOf("NWW05" to 1.0),
            recentLandingPorts = null,
            latestLandingPort = "FRLEH",
            latestLandingFacade = "MEMN",
        )
}
