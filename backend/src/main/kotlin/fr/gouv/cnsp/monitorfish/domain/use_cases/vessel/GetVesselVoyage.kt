package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessagesAndAlerts
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Voyage
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoLogbookFishingTripFound
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PNOAndLANAlertRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.VoyageRequest
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetVesselVoyage(
    private val logbookReportRepository: LogbookReportRepository,
    private val PNOAndLANAlertRepository: PNOAndLANAlertRepository,
    private val getLogbookMessages: GetLogbookMessages,
) {
    private val logger = LoggerFactory.getLogger(GetVesselVoyage::class.java)

    fun execute(internalReferenceNumber: String, voyageRequest: VoyageRequest, currentTripNumber: String?): Voyage {
        val trip = try {
            when (voyageRequest) {
                VoyageRequest.LAST -> logbookReportRepository.findLastTripBeforeDateTime(
                    internalReferenceNumber,
                    ZonedDateTime.now(),
                )
                VoyageRequest.PREVIOUS -> {
                    require(currentTripNumber != null) {
                        "Current trip number parameter must be not null"
                    }

                    logbookReportRepository.findTripBeforeTripNumber(internalReferenceNumber, currentTripNumber)
                }
                VoyageRequest.NEXT -> {
                    require(currentTripNumber != null) {
                        "Current trip number parameter must be not null"
                    }

                    logbookReportRepository.findTripAfterTripNumber(internalReferenceNumber, currentTripNumber)
                }
            }
        } catch (e: IllegalArgumentException) {
            throw NoLogbookFishingTripFound("Could not fetch voyage for request \"${voyageRequest}\": ${e.message}", e)
        }

        val isLastVoyage = getIsLastVoyage(currentTripNumber, voyageRequest, internalReferenceNumber, trip.tripNumber)
        val isFirstVoyage = getIsFirstVoyage(internalReferenceNumber, trip.tripNumber)

        val alerts = PNOAndLANAlertRepository.findAlertsOfTypes(
            listOf(AlertTypeMapping.PNO_LAN_WEIGHT_TOLERANCE_ALERT),
            internalReferenceNumber,
            trip.tripNumber,
        )

        val logbookMessages = getLogbookMessages.execute(
            internalReferenceNumber,
            trip.startDate,
            trip.endDate,
            trip.tripNumber,
        )

        return Voyage(
            isLastVoyage,
            isFirstVoyage,
            trip.startDate,
            trip.endDate,
            trip.tripNumber,
            LogbookMessagesAndAlerts(logbookMessages, alerts),
        )
    }

    private fun getIsLastVoyage(
        currentTripNumber: String?,
        voyageRequest: VoyageRequest,
        internalReferenceNumber: String,
        tripNumber: String,
    ): Boolean {
        if (currentTripNumber == null) {
            return true
        }

        if (voyageRequest == VoyageRequest.PREVIOUS) {
            return false
        }

        return try {
            logbookReportRepository.findTripAfterTripNumber(internalReferenceNumber, tripNumber)

            false
        } catch (e: NoLogbookFishingTripFound) {
            true
        }
    }

    private fun getIsFirstVoyage(
        internalReferenceNumber: String,
        tripNumber: String,
    ): Boolean {
        return try {
            logbookReportRepository.findTripBeforeTripNumber(internalReferenceNumber, tripNumber)

            false
        } catch (e: NoLogbookFishingTripFound) {
            true
        }
    }
}
