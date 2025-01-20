package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.ScipSpeciesType

data class FleetSegmentDataOutput(
    val segment: String,
    val segmentName: String,
    val mainScipSpeciesType: ScipSpeciesType?,
    val maxMesh: Double?,
    val minMesh: Double?,
    val minShareOfTargetSpecies: Double?,
    val priority: Double,
    val vesselTypes: List<String>,
    val gears: List<String>,
    val faoAreas: List<String>,
    val targetSpecies: List<String>,
    val impactRiskFactor: Double,
    val year: Int,
) {
    companion object {
        fun fromFleetSegment(fleetSegment: FleetSegment): FleetSegmentDataOutput =
            FleetSegmentDataOutput(
                segment = fleetSegment.segment,
                segmentName = fleetSegment.segmentName,
                mainScipSpeciesType = fleetSegment.mainScipSpeciesType,
                maxMesh = fleetSegment.maxMesh,
                minMesh = fleetSegment.minMesh,
                minShareOfTargetSpecies = fleetSegment.minShareOfTargetSpecies,
                priority = fleetSegment.priority,
                vesselTypes = fleetSegment.vesselTypes,
                gears = fleetSegment.gears,
                faoAreas = fleetSegment.faoAreas,
                targetSpecies = fleetSegment.targetSpecies,
                impactRiskFactor = fleetSegment.impactRiskFactor,
                year = fleetSegment.year,
            )
    }
}
