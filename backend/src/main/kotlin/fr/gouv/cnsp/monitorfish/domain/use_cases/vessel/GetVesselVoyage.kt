package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Voyage
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoLogbookFishingTripFound
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.VoyageRequest
import org.slf4j.LoggerFactory

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
        val vesselTrips = logbookReportRepository.findAllTrips(internalReferenceNumber)
        var tripIndex: Int?
        var trip =
            try {
                when (voyageRequest) {
                    VoyageRequest.LAST -> {
                        tripIndex = vesselTrips.size - 1
                        vesselTrips.last()
                    }
                    VoyageRequest.PREVIOUS -> {
                        require(tripNumber != null) {
                            "Current trip number parameter must be not null"
                        }
                        tripIndex = vesselTrips.indexOfFirst { it.tripNumber == tripNumber } - 1
                        require(tripIndex >= 0) {
                            "Trip $tripNumber not found"
                        }
                        vesselTrips[tripIndex]
                    }
                    VoyageRequest.NEXT -> {
                        require(tripNumber != null) {
                            "Current trip number parameter must be not null"
                        }
                        tripIndex = vesselTrips.indexOfFirst { it.tripNumber == tripNumber } + 1
                        require(tripIndex < vesselTrips.size) {
                            "Trip $tripNumber not found"
                        }
                        vesselTrips[tripIndex]
                    }

                    VoyageRequest.EQUALS -> {
                        require(tripNumber != null) {
                            "trip number parameter must be not null"
                        }
                        tripIndex = vesselTrips.indexOfFirst { it.tripNumber == tripNumber }
                        require(tripIndex >= 0) {
                            "Trip $tripNumber not found"
                        }
                        vesselTrips[tripIndex]
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

        val logbookMessages =
            getLogbookMessages.execute(
                internalReferenceNumber = internalReferenceNumber,
                firstOperationDateTime = trip.firstOperationDateTime,
                lastOperationDateTime = trip.lastOperationDateTime,
                tripNumber = trip.tripNumber,
            )
        val software = logbookMessages.firstOrNull()?.software

        return Voyage(
            isLastVoyage = tripIndex == vesselTrips.size - 1,
            isFirstVoyage = tripIndex == 0,
            startDate = trip.startDateTime,
            endDate = trip.endDateTime,
            tripNumber = trip.tripNumber,
            software = software,
            logbookMessages = logbookMessages,
        )
    }
}
