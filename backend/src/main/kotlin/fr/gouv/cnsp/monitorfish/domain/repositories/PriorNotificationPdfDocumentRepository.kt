package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PdfDocument

interface PriorNotificationPdfDocumentRepository {
    fun findByReportId(reportId: String): PdfDocument

    fun deleteByReportId(reportId: String)
}
