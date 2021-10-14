package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.ERSMessagesAndAlerts
import fr.gouv.cnsp.monitorfish.domain.entities.Voyage
import fr.gouv.cnsp.monitorfish.domain.entities.VoyageDatesAndTripNumber
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoLogbookFishingTripFound
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.VoyageRequest
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetVesselVoyage(private val ersRepository: ERSRepository,
                      private val alertRepository: AlertRepository,
                      private val getERSMessages: GetERSMessages) {
    private val logger = LoggerFactory.getLogger(GetVesselVoyage::class.java)

    fun execute(internalReferenceNumber: String, voyageRequest: VoyageRequest, dateTime: ZonedDateTime?): Voyage {
        val queryDateTime = when (dateTime != null) {
            true -> dateTime
            false -> ZonedDateTime.now()
        }

        val trip = try {
            when (voyageRequest) {
                VoyageRequest.LAST -> ersRepository.findLastTripBefore(internalReferenceNumber, queryDateTime)
                VoyageRequest.PREVIOUS -> ersRepository.findSecondToLastTripBefore(internalReferenceNumber, queryDateTime)
                VoyageRequest.NEXT -> ersRepository.findSecondTripAfter(internalReferenceNumber, queryDateTime)
            }
        } catch (e: IllegalArgumentException) {
            throw NoLogbookFishingTripFound("Invalid 'voyageRequest' argument", e)
        }

        val isLastVoyage = getIsLastVoyage(dateTime, voyageRequest, internalReferenceNumber, trip.startDate)
        val isFirstVoyage = getIsFirstVoyage(internalReferenceNumber, trip.endDate)

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
                isFirstVoyage,
                trip.startDate,
                trip.endDate,
                ERSMessagesAndAlerts(ersMessages, alerts)
        )
    }

    private fun getIsLastVoyage(dateTime: ZonedDateTime?,
                                voyageRequest: VoyageRequest,
                                internalReferenceNumber: String,
                                startDate: ZonedDateTime): Boolean {
        if (dateTime == null) {
            return true
        }

        if (voyageRequest == VoyageRequest.PREVIOUS) {
            return false
        }

        return try {
            ersRepository.findSecondTripAfter(internalReferenceNumber, startDate)

            false
        } catch (e: NoLogbookFishingTripFound) {
            true
        }
    }

    private fun getIsFirstVoyage(internalReferenceNumber: String,
                                 endDate: ZonedDateTime): Boolean {
        return try {
            ersRepository.findSecondToLastTripBefore(internalReferenceNumber, endDate)

            false
        } catch (e: NoLogbookFishingTripFound) {
            true
        }
    }
}
