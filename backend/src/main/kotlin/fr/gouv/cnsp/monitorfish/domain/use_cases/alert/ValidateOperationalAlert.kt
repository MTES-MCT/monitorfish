package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.PendingAlertRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.SilencedAlertRepository
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class ValidateOperationalAlert(private val pendingAlertRepository: PendingAlertRepository,
                               private val reportingRepository: ReportingRepository,
                               private val silencedAlertRepository: SilencedAlertRepository) {
    private val logger = LoggerFactory.getLogger(ValidateOperationalAlert::class.java)

    fun execute(alertId: Int) {
        val now = ZonedDateTime.now()
        val validatedAlert = pendingAlertRepository.find(alertId)

        silencedAlertRepository.save(
                alert = validatedAlert,
                silencedAfterDate = null,
                silencedBeforeDate = now.plusHours(4))

        reportingRepository.save(validatedAlert, now)

        pendingAlertRepository.delete(alertId)
        logger.info("Alert $alertId has been validated and saved as reporting.")
    }
}
