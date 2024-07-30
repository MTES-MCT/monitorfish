package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.ManualPriorNotificationComputedValues
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationState

/**
 * Output data for the real-time computed values displayed within a prior notification form.
 */
data class ManualPriorNotificationComputedValuesDataOutput(
    /** Next initial state of the prior notification once it will be created or updated. */
    val nextState: PriorNotificationState,
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
                nextState = manualPriorNotificationComputedValues.nextState,
                isVesselUnderCharter = manualPriorNotificationComputedValues.isVesselUnderCharter,
                tripSegments = tripSegmentDataOutputs,
                types = priorNotificationTypeDataOutputs,
                riskFactor = manualPriorNotificationComputedValues.vesselRiskFactor,
            )
        }
    }
}
