package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ManualPriorNotificationRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PriorNotificationUploadRepository

@UseCase
class DeletePriorNotificationUpload(
    private val logbookReportRepository: LogbookReportRepository,
    private val manualPriorNotificationRepository: ManualPriorNotificationRepository,
    private val priorNotificationUploadRepository: PriorNotificationUploadRepository,
) {
    fun execute(
        identifier: PriorNotificationIdentifier,
        priorNotificationUploadId: String,
    ) {
        priorNotificationUploadRepository.deleteById(priorNotificationUploadId)

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
