package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.PendingAlertRepository
import org.slf4j.LoggerFactory

@UseCase
class ValidateOperationalAlert(private val pendingAlertRepository: PendingAlertRepository) {
    private val logger = LoggerFactory.getLogger(ValidateOperationalAlert::class.java)

    fun execute(id: Int) {
        return
    }
}
