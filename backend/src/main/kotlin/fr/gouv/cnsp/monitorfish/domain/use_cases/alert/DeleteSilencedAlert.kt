package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.SilencedAlertRepository
import org.slf4j.LoggerFactory

@UseCase
class DeleteSilencedAlert(private val silencedAlertRepository: SilencedAlertRepository) {
    private val logger = LoggerFactory.getLogger(DeleteSilencedAlert::class.java)

    fun execute(silencedAlertId: Int) {
        logger.info("Deleting silenced alert $silencedAlertId.")
        silencedAlertRepository.delete(silencedAlertId)
    }
}
