package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationState

/**
 * Output data for the real-time computed values displayed within an auto prior notification form.
 */
data class AutoPriorNotificationComputedValuesDataOutput(
    /** Next initial state of the auto prior notification once it will be created or updated. */
    val nextState: PriorNotificationState,
)
