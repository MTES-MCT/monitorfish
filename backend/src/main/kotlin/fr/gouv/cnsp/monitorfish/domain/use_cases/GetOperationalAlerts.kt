package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PendingAlertRepository
import org.slf4j.LoggerFactory

@UseCase
class GetOperationalAlerts(private val pendingAlertRepository: PendingAlertRepository,
                           private val lastPositionRepository: LastPositionRepository) {
    private val logger = LoggerFactory.getLogger(GetOperationalAlerts::class.java)

    fun execute(): List<PendingAlert> {
        val lastPositions = lastPositionRepository.findAll()

        return pendingAlertRepository.findAlertsOfTypes(listOf(AlertTypeMapping.THREE_MILES_TRAWLING_ALERT)).map { pendingAlert ->
            val riskFactor = lastPositions.find { it.internalReferenceNumber === pendingAlert.internalReferenceNumber }?.riskFactor
            pendingAlert.riskFactor = riskFactor

            if (riskFactor == null) {
                logger.warn("No risk factor for vessel ${pendingAlert.internalReferenceNumber} found in last positions table")
            }

            pendingAlert
        }
    }
}
