package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PriorNotificationPdfDocumentRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class UpdateLogbookPriorNotification(
    private val logbookReportRepository: LogbookReportRepository,
    private val priorNotificationPdfDocumentRepository: PriorNotificationPdfDocumentRepository,
    private val getPriorNotification: GetPriorNotification,
) {
    private val logger: Logger = LoggerFactory.getLogger(UpdateLogbookPriorNotification::class.java)

    fun execute(
        reportId: String,
        operationDate: ZonedDateTime,
        note: String?,
        updatedBy: String?,
    ): PriorNotification {
        // Any update must trigger a new PDF generation, so we delete the existing PDF document
        // which is re-generated by the Pipeline each time a PDF is deleted
        try {
            priorNotificationPdfDocumentRepository.deleteByReportId(reportId)
        } catch (e: Exception) {
            logger.warn("Could not delete existing PDF document", e)
        }

        logbookReportRepository.updatePriorNotificationNote(
            reportId = reportId,
            operationDate = operationDate,
            note = note,
            updatedBy = updatedBy,
        )

        return getPriorNotification.execute(reportId, operationDate, false)
    }
}
