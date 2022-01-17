package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.repositories.PendingAlertRepository
import org.slf4j.LoggerFactory

@UseCase
class GetOperationalAlerts(private val pendingAlertRepository: PendingAlertRepository) {
    private val logger = LoggerFactory.getLogger(GetOperationalAlerts::class.java)

    fun execute(): List<PendingAlert> {
        return pendingAlertRepository.findAlertsOfTypes(listOf(AlertTypeMapping.THREE_MILES_TRAWLING_ALERT))
    }
}
