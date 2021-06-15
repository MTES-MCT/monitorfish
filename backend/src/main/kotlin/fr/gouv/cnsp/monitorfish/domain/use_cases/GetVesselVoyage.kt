package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.ERSMessagesAndAlerts
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSMessageTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSOperationType
import fr.gouv.cnsp.monitorfish.domain.repositories.AlertRepository
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetVesselVoyage(private val alertRepository: AlertRepository,
                      private val getERSMessages: GetERSMessages) {
    private val logger = LoggerFactory.getLogger(GetVesselVoyage::class.java)

    fun execute(internalReferenceNumber: String, afterDepartureDate: ZonedDateTime, beforeDepartureDate: ZonedDateTime): ERSMessagesAndAlerts {
        val ersMessages = getERSMessages.execute(internalReferenceNumber, afterDepartureDate, beforeDepartureDate)
        val depMessage = ersMessages.first { it.operationType == ERSOperationType.DAT && it.messageType == ERSMessageTypeMapping.DEP.name }

        val alerts = depMessage.tripNumber?.let {
            alertRepository.findAlertsOfRules(
                    listOf(AlertTypeMapping.PNO_LAN_WEIGHT_TOLERANCE_ALERT),
                    internalReferenceNumber,
                    it)
        } ?: listOf()

        return ERSMessagesAndAlerts(ersMessages, alerts)
    }
}
