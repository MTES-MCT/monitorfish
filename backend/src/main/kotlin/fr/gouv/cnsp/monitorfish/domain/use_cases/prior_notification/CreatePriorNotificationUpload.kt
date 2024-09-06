package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationDocument
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ManualPriorNotificationRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PriorNotificationUploadRepository
import fr.gouv.cnsp.monitorfish.utils.CustomZonedDateTime

@UseCase
class CreatePriorNotificationUpload(
    private val logbookReportRepository: LogbookReportRepository,
    private val manualPriorNotificationRepository: ManualPriorNotificationRepository,
    private val priorNotificationUploadRepository: PriorNotificationUploadRepository,
) {
    fun execute(identifier: PriorNotificationIdentifier, content: ByteArray, fileName: String, mimeType: String) {
        val createdAt = CustomZonedDateTime.now()

        val newPriorNotificationDocument = PriorNotificationDocument(
            id = null,
            content = content,
            createdAt = createdAt,
            fileName = fileName,
            isManualPriorNotification = identifier.isManualPriorNotification,
            mimeType = mimeType,
            reportId = identifier.reportId,
            updatedAt = createdAt,
        )

        priorNotificationUploadRepository.save(newPriorNotificationDocument)

        if (identifier.isManualPriorNotification) {
            manualPriorNotificationRepository.updateState(
                reportId = identifier.reportId,
                isBeingSent = false,
                isSent = false,
                isVerified = false,
            )
        } else {
            logbookReportRepository.updatePriorNotificationState(
                reportId = identifier.reportId,
                operationDate = identifier.operationDate,
                isBeingSent = false,
                isSent = false,
                isVerified = false,
            )
        }
    }
}
