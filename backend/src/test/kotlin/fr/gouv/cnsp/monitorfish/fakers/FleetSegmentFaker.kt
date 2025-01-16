package fr.gouv.cnsp.monitorfish.fakers

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment

class FleetSegmentFaker {
    companion object {
        fun fakeFleetSegment(
            segment: String = "SEG001",
            segmentName: String = "Fake Segment Name",
            gears: List<String> = listOf("GEAR1", "GEAR2"),
            faoAreas: List<String> = listOf("FAO_AREA1", "FAO_AREA2"),
            targetSpecies: List<String> = listOf("SPECIES1", "SPECIES2"),
            impactRiskFactor: Double = 1.0,
            year: Int = 2023,
        ): FleetSegment =
            FleetSegment(
                segment = segment,
                segmentName = segmentName,
                gears = gears,
                faoAreas = faoAreas,
                targetSpecies = targetSpecies,
                impactRiskFactor = impactRiskFactor,
                year = year,
                mainScipSpeciesType = null,
                maxMesh = null,
                minMesh = null,
                minShareOfTargetSpecies = null,
                priority = 0.0,
                vesselTypes = listOf(),
            )
    }
}
