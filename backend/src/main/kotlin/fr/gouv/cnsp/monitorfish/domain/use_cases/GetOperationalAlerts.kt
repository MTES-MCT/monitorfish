package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.repositories.AlertRepository
import org.slf4j.LoggerFactory

@UseCase
class GetOperationalAlerts(private val alertRepository: AlertRepository) {
    private val logger = LoggerFactory.getLogger(GetOperationalAlerts::class.java)

    fun execute(): List<Alert> {
        return alertRepository.findAlertsOfTypes(listOf(AlertTypeMapping.THREE_MILES_TRAWLING_ALERT))
    }
}
