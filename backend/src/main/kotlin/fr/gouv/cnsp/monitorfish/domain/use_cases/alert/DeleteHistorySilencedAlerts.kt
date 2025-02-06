package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.SilencedAlertRepository
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.transaction.annotation.Transactional

@UseCase
class DeleteHistorySilencedAlerts(
    private val silencedAlertRepository: SilencedAlertRepository,
) {
    private val logger = LoggerFactory.getLogger(DeleteHistorySilencedAlerts::class.java)

    // Every day at 00:00
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    fun execute() {
        logger.info("Deleting historical silenced alerts (6 months old)...")
        silencedAlertRepository.deleteSixMonthsOldSilencedAlerts()
        logger.info("Deletion of historical silenced alerts done.")
    }
}
