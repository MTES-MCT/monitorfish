package fr.gouv.cnsp.monitorfish.fakers

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment

class FleetSegmentFaker {
    companion object {
        fun fakeFleetSegment(
            segment: String = "SEG001",
            segmentName: String = "Fake Segment Name",
            dirm: List<String> = listOf(),
            gears: List<String> = listOf("GEAR1", "GEAR2"),
            faoAreas: List<String> = listOf("FAO_AREA1", "FAO_AREA2"),
            targetSpecies: List<String> = listOf("SPECIES1", "SPECIES2"),
            bycatchSpecies: List<String> = listOf(),
            impactRiskFactor: Double = 1.0,
            year: Int = 2023,
        ): FleetSegment {
            return FleetSegment(
                segment = segment,
                segmentName = segmentName,
                dirm = dirm,
                gears = gears,
                faoAreas = faoAreas,
                targetSpecies = targetSpecies,
                bycatchSpecies = bycatchSpecies,
                impactRiskFactor = impactRiskFactor,
                year = year,
            )
        }
    }
}
