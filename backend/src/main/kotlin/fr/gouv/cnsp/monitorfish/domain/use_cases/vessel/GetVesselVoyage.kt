package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Voyage
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoLogbookFishingTripFound
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.VoyageRequest
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetVesselVoyage(
    private val logbookReportRepository: LogbookReportRepository,
    private val getLogbookMessages: GetLogbookMessages,
) {
    private val logger = LoggerFactory.getLogger(GetVesselVoyage::class.java)

    @Throws(BackendUsageException::class)
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
                            internalReferenceNumber = internalReferenceNumber,
                            /**
                             * This 4-hour buffer prevents incorrect message datetime to be filtered.
                             * Sometimes, vessel inboard computers might have offset datetime.
                             */
                            beforeDateTime = ZonedDateTime.now().plusHours(4),
                        )
                    VoyageRequest.PREVIOUS -> {
                        require(tripNumber != null) {
                            "Current trip number parameter must be not null"
                        }

                        logbookReportRepository.findTripBeforeTripNumber(
                            internalReferenceNumber = internalReferenceNumber,
                            tripNumber = tripNumber,
                        )
                    }
                    VoyageRequest.NEXT -> {
                        require(tripNumber != null) {
                            "Current trip number parameter must be not null"
                        }

                        logbookReportRepository.findTripAfterTripNumber(
                            internalReferenceNumber = internalReferenceNumber,
                            tripNumber = tripNumber,
                        )
                    }

                    VoyageRequest.EQUALS -> {
                        require(tripNumber != null) {
                            "trip number parameter must be not null"
                        }

                        logbookReportRepository.findFirstAndLastOperationsDatesOfTrip(
                            internalReferenceNumber = internalReferenceNumber,
                            tripNumber = tripNumber,
                        )
                    }
                }
            } catch (e: IllegalArgumentException) {
                throw BackendUsageException(
                    BackendUsageErrorCode.NOT_FOUND_BUT_OK,
                    message = "Could not fetch voyage for request \"${voyageRequest}\"",
                    cause = e,
                )
            } catch (e: NoLogbookFishingTripFound) {
                throw BackendUsageException(
                    BackendUsageErrorCode.NOT_FOUND_BUT_OK,
                    message = "Could not fetch voyage for request \"${voyageRequest}\"",
                    cause = e,
                )
            }

        val isLastVoyage = getIsLastVoyage(tripNumber, voyageRequest, internalReferenceNumber, trip.tripNumber)
        val isFirstVoyage = getIsFirstVoyage(internalReferenceNumber, trip.tripNumber)

        val logbookMessages =
            getLogbookMessages.execute(
                internalReferenceNumber = internalReferenceNumber,
                afterDepartureDate = trip.startDate,
                beforeDepartureDate = trip.endDate,
                tripNumber = trip.tripNumber,
            )
        val software = logbookMessages.firstOrNull()?.software

        return Voyage(
            isLastVoyage = isLastVoyage,
            isFirstVoyage = isFirstVoyage,
            startDate = trip.startDate,
            endDate = trip.endDateWithoutLAN,
            tripNumber = trip.tripNumber,
            software = software,
            logbookMessages = logbookMessages,
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
            logbookReportRepository.findTripAfterTripNumber(
                internalReferenceNumber = internalReferenceNumber,
                tripNumber = tripNumber,
            )

            false
        } catch (e: NoLogbookFishingTripFound) {
            true
        }
    }

    private fun getIsFirstVoyage(
        internalReferenceNumber: String,
        tripNumber: String,
    ): Boolean =
        try {
            logbookReportRepository.findTripBeforeTripNumber(
                internalReferenceNumber = internalReferenceNumber,
                tripNumber = tripNumber,
            )

            false
        } catch (e: NoLogbookFishingTripFound) {
            true
        }
}
