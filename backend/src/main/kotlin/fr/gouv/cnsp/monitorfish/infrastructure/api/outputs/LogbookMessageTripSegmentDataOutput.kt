package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTripSegment

class LogbookMessageTripSegmentDataOutput(
    val code: String,
    val name: String,
) {
    companion object {
        fun fromFleetSegment(fleetSegment: FleetSegment): LogbookMessageTripSegmentDataOutput {
            return LogbookMessageTripSegmentDataOutput(
                code = fleetSegment.segment,
                name = fleetSegment.segmentName,
            )
        }

        fun fromLogbookTripSegment(logbookTripSegment: LogbookTripSegment) =
            LogbookMessageTripSegmentDataOutput(
                code = logbookTripSegment.code,
                name = logbookTripSegment.name,
            )
    }
}
