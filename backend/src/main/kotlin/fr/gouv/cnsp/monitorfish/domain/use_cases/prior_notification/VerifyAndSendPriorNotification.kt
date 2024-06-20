package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ManualPriorNotificationRepository

@UseCase
class VerifyAndSendPriorNotification(
    private val logbookReportRepository: LogbookReportRepository,
    private val manualPriorNotificationRepository: ManualPriorNotificationRepository,
) {
    fun execute(reportId: String): PriorNotification {
        val autoPriorNotification = logbookReportRepository.findPriorNotificationByReportId(reportId)
        if (autoPriorNotification != null) {
            logbookReportRepository.updatePriorNotificationState(reportId, isBeingSent = true, isVerified = true)

            return logbookReportRepository.findPriorNotificationByReportId(reportId)
                ?: throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND)
        }

        manualPriorNotificationRepository.updateState(reportId, isBeingSent = true, isVerified = true)

        return manualPriorNotificationRepository.findByReportId(reportId)
            ?: throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND)
    }
}
