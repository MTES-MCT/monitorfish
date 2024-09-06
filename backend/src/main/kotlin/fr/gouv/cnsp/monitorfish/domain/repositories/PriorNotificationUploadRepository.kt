package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationDocument

interface PriorNotificationUploadRepository {
    fun findAllByReportId(reportId: String): List<PriorNotificationDocument>

    fun findById(id: String): PriorNotificationDocument

    fun save(newPriorNotificationDocument: PriorNotificationDocument): PriorNotificationDocument

    fun deleteById(id: String)
}
