package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationCheck

interface PriorNotificationCheckRepository {
    fun findByReportId(reportId: String): PriorNotificationCheck?

    fun save(nextPriorNotificationCheck: PriorNotificationCheck): PriorNotificationCheck
}
