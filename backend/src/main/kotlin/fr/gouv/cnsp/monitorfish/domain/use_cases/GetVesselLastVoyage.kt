package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.ERSMessagesAndAlerts
import fr.gouv.cnsp.monitorfish.domain.entities.Voyage
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSLastDepartureDateFound
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetVesselLastVoyage(private val ersRepository: ERSRepository,
                          private val alertRepository: AlertRepository,
                          private val getERSMessages: GetERSMessages) {
    private val logger = LoggerFactory.getLogger(GetVesselLastVoyage::class.java)

    fun execute(internalReferenceNumber: String, beforeDateTime: ZonedDateTime?): Voyage {

        val lastDepartureDateAndTripNumber = when (beforeDateTime != null) {
            true -> ersRepository.findLastDepartureDateAndTripNumber(internalReferenceNumber, beforeDateTime)
            false -> ersRepository.findLastDepartureDateAndTripNumber(internalReferenceNumber, ZonedDateTime.now())
        }

        val previousTripDepartureDate = try {
            // Will throw if no previous trip is found
            ersRepository.findLastDepartureDateAndTripNumber(
                    internalReferenceNumber,
                    lastDepartureDateAndTripNumber.lastDepartureDate)

            lastDepartureDateAndTripNumber.lastDepartureDate
        } catch (e: NoERSLastDepartureDateFound) {
            null
        }

        val nextTrip = try {
            ersRepository.findSecondDepartureDateByInternalReferenceNumber(
                    internalReferenceNumber,
                    lastDepartureDateAndTripNumber.lastDepartureDate)
        } catch (e: NoERSLastDepartureDateFound) {
            null
        }

        val isLastVoyage = beforeDateTime == null

        val alerts = lastDepartureDateAndTripNumber.tripNumber?.let {
            alertRepository.findAlertsOfRules(
                    listOf(AlertTypeMapping.PNO_LAN_WEIGHT_TOLERANCE_ALERT),
                    internalReferenceNumber,
                    it)
        } ?: listOf()

        val ersMessages = getERSMessages.execute(
                internalReferenceNumber,
                lastDepartureDateAndTripNumber.lastDepartureDate,
                beforeDateTime ?: ZonedDateTime.now())

        return Voyage(
                isLastVoyage,
                previousTripDepartureDate,
                nextTrip?.lastDepartureDate,
                ERSMessagesAndAlerts(ersMessages, alerts)
        )
    }
}
