package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import java.time.ZonedDateTime

object TestUtils {
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
            ),
            FleetSegment(
                "SWW04",
                "Midwater trawls",
                gears = listOf("OTM", "PTM"),
                targetSpecies = listOf("HKE"),
                faoAreas = listOf("27.8.c", "27.8"),
                year = currentYear,
                impactRiskFactor = 2.56,
            ),
            FleetSegment(
                "SWW06",
                "Seines",
                gears = listOf("SDN", "SSC", "SPR", "SX", "SV"),
                targetSpecies = listOf("HKE"),
                faoAreas = listOf("27.8.c", "27.8", "27.9"),
                year = currentYear,
                impactRiskFactor = 2.56,
            ),
            FleetSegment(
                "SWW07/08",
                "Gill and trammel nets",
                gears = listOf("GNS", "GN", "GND", "GNC", "GTN", "GTR", "GEN"),
                targetSpecies = listOf("HKE", "SOL", "PLE", "ANF"),
                faoAreas = listOf("27.8.c", "27.8", "27.9"),
                year = currentYear,
                impactRiskFactor = 2.56,
            ),
            FleetSegment(
                "SWW10",
                "Longlines targeting demersal",
                gears = listOf("LL", "LLS"),
                targetSpecies = listOf("HKE"),
                faoAreas = listOf("27.8.c", "27.8", "27.9"),
                year = currentYear,
                impactRiskFactor = 2.56,
            ),
            FleetSegment(
                "NWW01/02",
                "Trawl",
                gears = listOf("OT", "OTB", "OTM", "OTT", "PTB", "PT", "PTM", "TBN", "TBS", "TX", "TB"),
                targetSpecies = listOf("COD", "HAD", "WHG", "POK", "NEP", "SOL", "PLE", "HKE"),
                faoAreas = listOf("27.5.b", "27.6", "27.7.a", "27.7.d", "27.7"),
                year = currentYear,
                impactRiskFactor = 2.56,
            ),
            FleetSegment(
                "SWW06 WITH NO GEAR",
                "Trawl",
                gears = listOf(),
                targetSpecies = listOf("HKE"),
                faoAreas = listOf("27.9"),
                year = currentYear,
                impactRiskFactor = 2.56,
            ),
            FleetSegment(
                "SWW06 WITH NO SPECIES",
                "Trawl",
                gears = listOf("SDN", "SSC", "SPR", "SX", "SV"),
                targetSpecies = listOf(),
                faoAreas = listOf("27.9"),
                year = currentYear,
                impactRiskFactor = 2.56,
            ),
            FleetSegment(
                "SWW06 WITH NO FAO AREAS",
                "Trawl",
                gears = listOf("SDN", "SSC", "SPR", "SX", "SV"),
                targetSpecies = listOf("HKE"),
                faoAreas = listOf(),
                year = currentYear,
                impactRiskFactor = 2.56,
            ),
        )
    }
}
