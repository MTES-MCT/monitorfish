package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.ERSMessagesAndAlerts
import fr.gouv.cnsp.monitorfish.domain.entities.Voyage
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoLogbookFishingTripFound
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetVesselVoyage(private val ersRepository: ERSRepository,
                      private val alertRepository: AlertRepository,
                      private val getERSMessages: GetERSMessages) {
    private val logger = LoggerFactory.getLogger(GetVesselVoyage::class.java)

    fun execute(internalReferenceNumber: String, which: String, dateTime: ZonedDateTime?): Voyage {

        var isLastVoyage = (dateTime == null) || (which == "secondToLastTripBefore")

        val queryDateTime = when(dateTime != null) {
            true -> dateTime
            false -> ZonedDateTime.now()
        }

        val trip = try {
            when(which) {
                "lastTripBefore" -> ersRepository.findLastTripBefore(internalReferenceNumber, queryDateTime)
                "secondToLastTripBefore" -> ersRepository.findSecondToLastTripBefore(internalReferenceNumber, queryDateTime)
                "secondTripAfter" -> ersRepository.findSecondTripAfter(internalReferenceNumber, queryDateTime)
                else -> throw IllegalArgumentException("Invalid 'which' argument")
            }
        } catch (e: IllegalArgumentException) {
            throw NoLogbookFishingTripFound("Invalid 'which' argument", e)
        }

        if (!isLastVoyage) {
            try {
                ersRepository.findSecondTripAfter(internalReferenceNumber, trip.startDate)
            } catch (e: NoLogbookFishingTripFound) {
                isLastVoyage = true
            }
        }

        val alerts = alertRepository.findAlertsOfRules(
            listOf(AlertTypeMapping.PNO_LAN_WEIGHT_TOLERANCE_ALERT),
            internalReferenceNumber,
            trip.tripNumber
        )


        val ersMessages = getERSMessages.execute(
            internalReferenceNumber,
            trip.startDate,
            trip.endDate,
            trip.tripNumber
        )

        return Voyage(
                isLastVoyage,
                trip.startDate,
                trip.endDate,
                ERSMessagesAndAlerts(ersMessages, alerts)
        )
    }
}
