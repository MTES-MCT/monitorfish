package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.ScipSpeciesType
import java.time.ZonedDateTime

object TestUtils {
    val fleetSegmentsForComputation =
        listOf(
            FleetSegment(
                segment = "T8-9",
                segmentName = "Trawls areas 8 and 9 targeting demersal",
                mainScipSpeciesType = ScipSpeciesType.DEMERSAL,
                maxMesh = 100.0,
                minMesh = 50.0,
                minShareOfTargetSpecies = null,
                priority = 0.0,
                vesselTypes = emptyList(),
                gears = listOf("OTM", "OTB", "PTM", "PTB"),
                faoAreas = listOf("27.8", "27.9"),
                targetSpecies = emptyList(),
                impactRiskFactor = 2.2,
                year = 2050,
            ),
            FleetSegment(
                segment = "T8-PEL",
                segmentName = "Trawls area 8 targeting pelagic",
                mainScipSpeciesType = ScipSpeciesType.PELAGIC,
                maxMesh = 100.0,
                minMesh = 50.0,
                minShareOfTargetSpecies = null,
                priority = 0.0,
                vesselTypes = emptyList(),
                gears = listOf("OTM", "OTB", "PTM", "PTB"),
                faoAreas = listOf("27.8"),
                targetSpecies = emptyList(),
                impactRiskFactor = 2.3,
                year = 2050,
            ),
            FleetSegment(
                segment = "L",
                segmentName = "Lines",
                mainScipSpeciesType = null,
                maxMesh = null,
                minMesh = null,
                minShareOfTargetSpecies = null,
                priority = 0.0,
                vesselTypes = emptyList(),
                gears = listOf("LLS", "LLM", "LHM", "LHP"),
                faoAreas = listOf("27", "37"),
                targetSpecies = emptyList(),
                impactRiskFactor = 1.9,
                year = 2050,
            ),
            FleetSegment(
                segment = "L HKE",
                segmentName = "Lines targeting HKE",
                mainScipSpeciesType = null,
                maxMesh = null,
                minMesh = null,
                minShareOfTargetSpecies = 0.2,
                priority = 1.0,
                vesselTypes = emptyList(),
                gears = listOf("LLS", "LLM", "LHM", "LHP"),
                faoAreas = listOf("27", "37"),
                targetSpecies = listOf("HKE", "AAA", "BBB"),
                impactRiskFactor = 2.2,
                year = 2050,
            ),
            FleetSegment(
                segment = "PS BFT",
                segmentName = "Seines targeting BFT",
                mainScipSpeciesType = null,
                maxMesh = null,
                minMesh = null,
                minShareOfTargetSpecies = 0.0,
                priority = 1.0,
                vesselTypes = emptyList(),
                gears = listOf("PS"),
                faoAreas = listOf("27.7", "37"),
                targetSpecies = listOf("BFT"),
                impactRiskFactor = 2.2,
                year = 2050,
            ),
            FleetSegment(
                segment = "PS BFT Prioritized",
                segmentName = "Seines targeting BFT",
                mainScipSpeciesType = null,
                maxMesh = null,
                minMesh = null,
                minShareOfTargetSpecies = 0.0,
                priority = 2.0,
                vesselTypes = emptyList(),
                gears = listOf("PS"),
                faoAreas = listOf("27.7", "37"),
                targetSpecies = listOf("BFT"),
                impactRiskFactor = 2.2,
                year = 2050,
            ),
            FleetSegment(
                segment = "FT",
                segmentName = "Freezer trawlers",
                mainScipSpeciesType = null,
                maxMesh = 100.0,
                minMesh = 80.0,
                minShareOfTargetSpecies = null,
                priority = 2.0,
                vesselTypes = listOf("Chalutier congélateur", "Chalutier pêche arrière congélateur"),
                gears = listOf("OTB", "PTB"),
                faoAreas = listOf("27", "37"),
                targetSpecies = emptyList(),
                impactRiskFactor = 3.3,
                year = 2050,
            ),
        )

    fun getDummyFleetSegments(): List<FleetSegment> {
        val currentYear = ZonedDateTime.now().year

        return listOf(
            FleetSegment(
                "SWW01/02/03",
                "Bottom trawls",
                gears = listOf("OTB", "OTT", "PTB", "OT", "PT", "TBN", "TBS", "TX", "TB"),
                targetSpecies = listOf("HKE", "SOL", "NEP", "ANF"),
                faoAreas = listOf("27.8.c", "27.8", "27.9"),
                year = currentYear,
                impactRiskFactor = 2.56,
                mainScipSpeciesType = null,
                maxMesh = null,
                minMesh = null,
                minShareOfTargetSpecies = null,
                priority = 0.0,
                vesselTypes = listOf(),
            ),
            FleetSegment(
                "SWW04",
                "Midwater trawls",
                gears = listOf("OTM", "PTM"),
                targetSpecies = listOf("HKE"),
                faoAreas = listOf("27.8.c", "27.8"),
                year = currentYear,
                impactRiskFactor = 2.56,
                mainScipSpeciesType = null,
                maxMesh = null,
                minMesh = null,
                minShareOfTargetSpecies = null,
                priority = 0.0,
                vesselTypes = listOf(),
            ),
            FleetSegment(
                "SWW06",
                "Seines",
                gears = listOf("SDN", "SSC", "SPR", "SX", "SV"),
                targetSpecies = listOf("HKE"),
                faoAreas = listOf("27.8.c", "27.8", "27.9"),
                year = currentYear,
                impactRiskFactor = 2.56,
                mainScipSpeciesType = null,
                maxMesh = null,
                minMesh = null,
                minShareOfTargetSpecies = null,
                priority = 0.0,
                vesselTypes = listOf(),
            ),
            FleetSegment(
                "SWW07/08",
                "Gill and trammel nets",
                gears = listOf("GNS", "GN", "GND", "GNC", "GTN", "GTR", "GEN"),
                targetSpecies = listOf("HKE", "SOL", "PLE", "ANF"),
                faoAreas = listOf("27.8.c", "27.8", "27.9"),
                year = currentYear,
                impactRiskFactor = 2.56,
                mainScipSpeciesType = null,
                maxMesh = null,
                minMesh = null,
                minShareOfTargetSpecies = null,
                priority = 0.0,
                vesselTypes = listOf(),
            ),
            FleetSegment(
                "SWW10",
                "Longlines targeting demersal",
                gears = listOf("LL", "LLS"),
                targetSpecies = listOf("HKE"),
                faoAreas = listOf("27.8.c", "27.8", "27.9"),
                year = currentYear,
                impactRiskFactor = 2.56,
                mainScipSpeciesType = null,
                maxMesh = null,
                minMesh = null,
                minShareOfTargetSpecies = null,
                priority = 0.0,
                vesselTypes = listOf(),
            ),
            FleetSegment(
                "NWW01/02",
                "Trawl",
                gears = listOf("OT", "OTB", "OTM", "OTT", "PTB", "PT", "PTM", "TBN", "TBS", "TX", "TB"),
                targetSpecies = listOf("COD", "HAD", "WHG", "POK", "NEP", "SOL", "PLE", "HKE"),
                faoAreas = listOf("27.5.b", "27.6", "27.7.a", "27.7.d", "27.7"),
                year = currentYear,
                impactRiskFactor = 2.56,
                mainScipSpeciesType = null,
                maxMesh = null,
                minMesh = null,
                minShareOfTargetSpecies = null,
                priority = 0.0,
                vesselTypes = listOf(),
            ),
            FleetSegment(
                "SWW06 WITH NO GEAR",
                "Trawl",
                gears = listOf(),
                targetSpecies = listOf("HKE"),
                faoAreas = listOf("27.9"),
                year = currentYear,
                impactRiskFactor = 2.56,
                mainScipSpeciesType = null,
                maxMesh = null,
                minMesh = null,
                minShareOfTargetSpecies = null,
                priority = 0.0,
                vesselTypes = listOf(),
            ),
            FleetSegment(
                "SWW06 WITH NO SPECIES",
                "Trawl",
                gears = listOf("SDN", "SSC", "SPR", "SX", "SV"),
                targetSpecies = listOf(),
                faoAreas = listOf("27.9"),
                year = currentYear,
                impactRiskFactor = 2.56,
                mainScipSpeciesType = null,
                maxMesh = null,
                minMesh = null,
                minShareOfTargetSpecies = null,
                priority = 0.0,
                vesselTypes = listOf(),
            ),
            FleetSegment(
                "SWW06 WITH NO FAO AREAS",
                "Trawl",
                gears = listOf("SDN", "SSC", "SPR", "SX", "SV"),
                targetSpecies = listOf("HKE"),
                faoAreas = listOf(),
                year = currentYear,
                impactRiskFactor = 2.56,
                mainScipSpeciesType = null,
                maxMesh = null,
                minMesh = null,
                minShareOfTargetSpecies = null,
                priority = 0.0,
                vesselTypes = listOf(),
            ),
        )
    }
}
