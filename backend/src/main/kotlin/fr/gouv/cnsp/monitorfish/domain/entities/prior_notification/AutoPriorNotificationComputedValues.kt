package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

/**
 * Real-time computed values displayed within an auto prior notification form.
 */
data class AutoPriorNotificationComputedValues(
    /** Next initial state of the auto prior notification once it will be created or updated. */
    val nextState: PriorNotificationState,
)
