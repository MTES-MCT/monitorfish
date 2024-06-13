package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PnoType

data class ManualPriorNotificationComputationDataOutput(
    val tripSegments: List<LogbookMessageTripSegmentDataOutput>,
    val types: List<PriorNotificationTypeDataOutput>,
    val vesselRiskFactor: Double,
) {
    companion object {
        fun fromFleetSegmentsAndPriotNotificationTypesAndRiskFactor(
            fleetSegments: List<FleetSegment>,
            priorNotificationTypes: List<PnoType>,
            riskFactor: Double,
        ): ManualPriorNotificationComputationDataOutput {
            val tripSegmentDataOutputs = fleetSegments.map { LogbookMessageTripSegmentDataOutput.fromFleetSegment(it) }
            val priorNotificationTypeDataOutputs = priorNotificationTypes
                .map { PriorNotificationTypeDataOutput.fromPnoType(it) }

            return ManualPriorNotificationComputationDataOutput(
                tripSegments = tripSegmentDataOutputs,
                types = priorNotificationTypeDataOutputs,
                riskFactor,
            )
        }
    }
}
