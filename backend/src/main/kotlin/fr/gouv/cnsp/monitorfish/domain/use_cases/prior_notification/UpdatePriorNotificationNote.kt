package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository

@UseCase
class UpdatePriorNotificationNote(
    private val logbookReportRepository: LogbookReportRepository,
    private val getPriorNotification: GetPriorNotification,
) {
    fun execute(
        note: String?,
        reportId: String,
    ): PriorNotification {
        logbookReportRepository.updatePriorNotificationNote(
            reportId = reportId,
            note = note,
        )

        return getPriorNotification.execute(reportId, false)
    }
}
