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

    fun execute(
        internalReferenceNumber: String,
        voyageRequest: VoyageRequest,
        tripNumber: String?,
    ): Voyage {
        val trip =
            try {
                when (voyageRequest) {
                    VoyageRequest.LAST ->
                        logbookReportRepository.findLastTripBeforeDateTime(
                            internalReferenceNumber,
                            /**
                             * This 4-hour buffer prevents incorrect message datetime to be filtered.
                             * Sometimes, vessel inboard computers might have offset datetime.
                             */
                            ZonedDateTime.now().plusHours(4),
                        )
                    VoyageRequest.PREVIOUS -> {
                        require(tripNumber != null) {
                            "Current trip number parameter must be not null"
                        }

                        logbookReportRepository.findTripBeforeTripNumber(internalReferenceNumber, tripNumber)
                    }
                    VoyageRequest.NEXT -> {
                        require(tripNumber != null) {
                            "Current trip number parameter must be not null"
                        }

                        logbookReportRepository.findTripAfterTripNumber(internalReferenceNumber, tripNumber)
                    }

                    VoyageRequest.EQUALS -> {
                        require(tripNumber != null) {
                            "trip number parameter must be not null"
                        }

                        logbookReportRepository.findFirstAndLastOperationsDatesOfTrip(
                            internalReferenceNumber,
                            tripNumber,
                        )
                    }
                }
            } catch (e: IllegalArgumentException) {
                throw NoLogbookFishingTripFound(
                    "Could not fetch voyage for request \"${voyageRequest}\": ${e.message}",
                    e,
                )
            }

        val isLastVoyage = getIsLastVoyage(tripNumber, voyageRequest, internalReferenceNumber, trip.tripNumber)
        val isFirstVoyage = getIsFirstVoyage(internalReferenceNumber, trip.tripNumber)

        val alerts =
            PNOAndLANAlertRepository.findAlertsOfTypes(
                listOf(AlertTypeMapping.PNO_LAN_WEIGHT_TOLERANCE_ALERT),
                internalReferenceNumber,
                trip.tripNumber,
            )

        val logbookMessages =
            getLogbookMessages.execute(
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
