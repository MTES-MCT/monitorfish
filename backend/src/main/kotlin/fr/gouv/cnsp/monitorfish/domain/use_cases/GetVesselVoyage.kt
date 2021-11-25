package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.ERSMessagesAndAlerts
import fr.gouv.cnsp.monitorfish.domain.entities.Voyage
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

    fun execute(internalReferenceNumber: String, voyageRequest: VoyageRequest, currentTripNumber: Int?): Voyage {
        val trip = try {
            when (voyageRequest) {
                VoyageRequest.LAST -> ersRepository.findLastTripBeforeDateTime(internalReferenceNumber, ZonedDateTime.now())
                VoyageRequest.PREVIOUS -> {
                    require(currentTripNumber != null) {
                        "Current trip number parameter must be not null"
                    }

                    ersRepository.findTripBeforeTripNumber(internalReferenceNumber, currentTripNumber)
                }
                VoyageRequest.NEXT -> {
                    require(currentTripNumber != null) {
                        "Current trip number parameter must be not null"
                    }

                    ersRepository.findTripAfterTripNumber(internalReferenceNumber, currentTripNumber)
                }
            }
        } catch (e: IllegalArgumentException) {
            throw NoLogbookFishingTripFound("Could not fetch voyage for request \"${voyageRequest}\": ${e.message}", e)
        }

        val isLastVoyage = getIsLastVoyage(currentTripNumber, voyageRequest, internalReferenceNumber, trip.tripNumber)
        val isFirstVoyage = getIsFirstVoyage(internalReferenceNumber, trip.tripNumber)

        val alerts = alertRepository.findAlertsOfTypes(
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
                trip.tripNumber,
                ERSMessagesAndAlerts(ersMessages, alerts)
        )
    }

    private fun getIsLastVoyage(currentTripNumber: Int?,
                                voyageRequest: VoyageRequest,
                                internalReferenceNumber: String,
                                tripNumber: Int): Boolean {
        if (currentTripNumber == null) {
            return true
        }

        if (voyageRequest == VoyageRequest.PREVIOUS) {
            return false
        }

        return try {
            ersRepository.findTripAfterTripNumber(internalReferenceNumber, tripNumber)

            false
        } catch (e: NoLogbookFishingTripFound) {
            true
        }
    }

    private fun getIsFirstVoyage(internalReferenceNumber: String,
                                 tripNumber: Int): Boolean {
        return try {
            ersRepository.findTripBeforeTripNumber(internalReferenceNumber, tripNumber)

            false
        } catch (e: NoLogbookFishingTripFound) {
            true
        }
    }
}
