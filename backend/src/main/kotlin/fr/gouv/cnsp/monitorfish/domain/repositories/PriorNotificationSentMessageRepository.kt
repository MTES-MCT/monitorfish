package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationSentMessage

interface PriorNotificationSentMessageRepository {
    fun findAllByReportId(reportId: String): List<PriorNotificationSentMessage>
}
