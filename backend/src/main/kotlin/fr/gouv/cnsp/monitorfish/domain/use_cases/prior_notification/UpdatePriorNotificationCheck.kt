package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationCheck
import fr.gouv.cnsp.monitorfish.domain.repositories.PriorNotificationCheckRepository

@UseCase
class UpdatePriorNotificationCheck(private val priorNotificationCheckRepository: PriorNotificationCheckRepository) {
    fun execute(nextPriorNotificationCheck: PriorNotificationCheck): PriorNotificationCheck {
        return priorNotificationCheckRepository.save(nextPriorNotificationCheck)
    }
}
