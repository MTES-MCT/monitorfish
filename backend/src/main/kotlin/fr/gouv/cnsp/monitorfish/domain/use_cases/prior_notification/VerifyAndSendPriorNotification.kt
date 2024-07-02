package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ManualPriorNotificationRepository

@UseCase
class VerifyAndSendPriorNotification(
    private val logbookReportRepository: LogbookReportRepository,
    private val manualPriorNotificationRepository: ManualPriorNotificationRepository,
    private val getPriorNotification: GetPriorNotification,
) {
    fun execute(reportId: String, isManuallyCreated: Boolean): PriorNotification {
        if (isManuallyCreated) {
            manualPriorNotificationRepository.updateState(reportId, isBeingSent = true, isVerified = true)
        } else {
            logbookReportRepository.updatePriorNotificationState(reportId, isBeingSent = true, isVerified = true)
        }

        return getPriorNotification.execute(reportId, isManuallyCreated)
    }
}
