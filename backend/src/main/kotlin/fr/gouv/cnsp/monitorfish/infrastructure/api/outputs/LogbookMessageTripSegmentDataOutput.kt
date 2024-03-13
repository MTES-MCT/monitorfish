package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTripSegment

class LogbookMessageTripSegmentDataOutput(
    val segment: String,
    val segmentName: String,
) {
    companion object {
        fun fromLogbookTripSegment(logbookTripSegment: LogbookTripSegment) =
            LogbookMessageTripSegmentDataOutput(
                segment = logbookTripSegment.segment,
                segmentName = logbookTripSegment.segmentName,
            )
    }
}
