package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ManualPriorNotificationRepository
import java.time.ZonedDateTime

@UseCase
class InvalidatePriorNotification(
    private val logbookReportRepository: LogbookReportRepository,
    private val manualPriorNotificationRepository: ManualPriorNotificationRepository,
    private val getPriorNotification: GetPriorNotification,
) {
    fun execute(
        reportId: String,
        operationDate: ZonedDateTime,
        isManuallyCreated: Boolean,
    ): PriorNotification {
        if (isManuallyCreated) {
            manualPriorNotificationRepository.invalidate(reportId)
        } else {
            logbookReportRepository.invalidate(reportId, operationDate)
        }

        return getPriorNotification.execute(reportId, operationDate, isManuallyCreated)
    }
}
