package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment

/**
 * Real-time computed values displayed within a manual prior notification form.
 */
data class ManualPriorNotificationComputedValues(
    val isInVerificationScope: Boolean,
    val isVesselUnderCharter: Boolean?,
    /** Next initial state of the manual prior notification once it will be created or updated. */
    val nextState: PriorNotificationState,
    val tripSegments: List<FleetSegment>,
    val types: List<PnoType>,
    val vesselRiskFactor: Double?,
)
