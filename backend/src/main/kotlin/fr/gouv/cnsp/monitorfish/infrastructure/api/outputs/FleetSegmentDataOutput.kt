package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.FleetSegment

data class FleetSegmentDataOutput(
        val segment: String,
        val segmentName: String,
        val dirm: List<String>,
        val gears: List<String>,
        val faoAreas: List<String>,
        val targetSpecies: List<String>,
        val bycatchSpecies: List<String>) {
    companion object {
        fun fromFleetSegment(fleetSegment: FleetSegment): FleetSegmentDataOutput {
            return FleetSegmentDataOutput(
                    segment = fleetSegment.segment,
                    segmentName = fleetSegment.segmentName,
                    dirm = fleetSegment.dirm,
                    gears = fleetSegment.gears,
                    faoAreas = fleetSegment.faoAreas,
                    targetSpecies = fleetSegment.targetSpecies,
                    bycatchSpecies = fleetSegment.bycatchSpecies)
        }
    }
}
