package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PdfDocument
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.PriorNotificationPdfDocumentRepository

@UseCase
class GetPriorNotificationPdfDocument(
    private val priorNotificationPdfDocumentRepository: PriorNotificationPdfDocumentRepository,
) {
    fun execute(reportId: String, isVerifyingExistence: Boolean): PdfDocument? {
        return try {
            priorNotificationPdfDocumentRepository.findByReportId(reportId)
        } catch (e: BackendUsageException) {
            if (isVerifyingExistence) {
                return null
            }

            throw e
        }
    }
}
