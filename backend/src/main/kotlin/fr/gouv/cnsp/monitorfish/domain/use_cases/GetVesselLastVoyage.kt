package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.ERSMessagesAndAlerts
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetVesselLastVoyage(private val ersRepository: ERSRepository,
                          private val alertRepository: AlertRepository,
                          private val getERSMessages: GetERSMessages) {
    private val logger = LoggerFactory.getLogger(GetVesselLastVoyage::class.java)

    fun execute(internalReferenceNumber: String): ERSMessagesAndAlerts {
        val lastDepartureDateAndTripNumber = ersRepository.findLastDepartureDateAndTripNumber(internalReferenceNumber)

        val alerts = lastDepartureDateAndTripNumber.tripNumber?.let {
            alertRepository.findAlertsOfRules(
                    listOf(AlertTypeMapping.PNO_LAN_WEIGHT_TOLERANCE_ALERT),
                    internalReferenceNumber,
                    it)
        } ?: listOf()

        val ersMessages = getERSMessages.execute(internalReferenceNumber, lastDepartureDateAndTripNumber.lastDepartureDate, ZonedDateTime.now())

        return ERSMessagesAndAlerts(ersMessages, alerts)
    }
}
