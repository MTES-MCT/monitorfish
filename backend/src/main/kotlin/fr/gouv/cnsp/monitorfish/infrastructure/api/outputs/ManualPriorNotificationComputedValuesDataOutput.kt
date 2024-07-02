package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.ManualPriorNotificationComputedValues

data class ManualPriorNotificationComputedValuesDataOutput(
    val isInVerificationScope: Boolean,
    val isVesselUnderCharter: Boolean?,
    val tripSegments: List<LogbookMessageTripSegmentDataOutput>,
    val types: List<PriorNotificationTypeDataOutput>,
    val riskFactor: Double?,
) {
    companion object {
        fun fromManualPriorNotificationComputedValues(
            manualPriorNotificationComputedValues: ManualPriorNotificationComputedValues,
        ): ManualPriorNotificationComputedValuesDataOutput {
            val tripSegmentDataOutputs = manualPriorNotificationComputedValues.tripSegments
                .map { LogbookMessageTripSegmentDataOutput.fromFleetSegment(it) }
            val priorNotificationTypeDataOutputs = manualPriorNotificationComputedValues.types
                .map { PriorNotificationTypeDataOutput.fromPnoType(it) }

            return ManualPriorNotificationComputedValuesDataOutput(
                isInVerificationScope = manualPriorNotificationComputedValues.isInVerificationScope,
                isVesselUnderCharter = manualPriorNotificationComputedValues.isVesselUnderCharter,
                tripSegments = tripSegmentDataOutputs,
                types = priorNotificationTypeDataOutputs,
                riskFactor = manualPriorNotificationComputedValues.vesselRiskFactor,
            )
        }
    }
}
