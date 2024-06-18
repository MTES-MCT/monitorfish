package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationCheck
import fr.gouv.cnsp.monitorfish.domain.repositories.PriorNotificationCheckRepository

@UseCase
class GetPriorNotificationCheck(private val priorNotificationCheckRepository: PriorNotificationCheckRepository) {
    fun execute(reportId: String): PriorNotificationCheck {
        val priorNotificationCheck = priorNotificationCheckRepository.findByReportId(reportId)
        if (priorNotificationCheck == null) {
            val newPriorNotificationCheck = PriorNotificationCheck.new(reportId)

            return priorNotificationCheckRepository.save(newPriorNotificationCheck)
        }

        return priorNotificationCheck
    }
}
