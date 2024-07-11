package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PdfDocument
import fr.gouv.cnsp.monitorfish.domain.repositories.PriorNotificationPdfDocumentRepository
import org.springframework.web.multipart.MultipartFile

@UseCase
class UploadPdfDocument(
    private val priorNotificationPdfDocumentRepository: PriorNotificationPdfDocumentRepository,
) {
    fun execute(reportId: String, file: MultipartFile): PdfDocument {
        return priorNotificationPdfDocumentRepository.findByReportId(reportId)
    }
}
