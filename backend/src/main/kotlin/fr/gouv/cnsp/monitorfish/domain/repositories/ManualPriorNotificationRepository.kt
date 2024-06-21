package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationsFilter

interface ManualPriorNotificationRepository {
    fun findAll(filter: PriorNotificationsFilter): List<PriorNotification>

    fun findByReportId(reportId: String): PriorNotification?

    fun save(newOrNextPriorNotification: PriorNotification): String

    fun updateState(reportId: String, isBeingSent: Boolean, isVerified: Boolean)
}
