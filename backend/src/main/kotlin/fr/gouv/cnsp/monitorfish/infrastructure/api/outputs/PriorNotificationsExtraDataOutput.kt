package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.facade.SeafrontGroup
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationStats

data class PriorNotificationsExtraDataOutput(
    val perSeafrontGroupCount: Map<SeafrontGroup, Int>,
) {
    companion object {
        fun fromPriorNotificationStats(
            priorNotificationStats: PriorNotificationStats,
        ): PriorNotificationsExtraDataOutput {
            return PriorNotificationsExtraDataOutput(
                perSeafrontGroupCount = priorNotificationStats.perSeafrontGroupCount,
            )
        }
    }
}
