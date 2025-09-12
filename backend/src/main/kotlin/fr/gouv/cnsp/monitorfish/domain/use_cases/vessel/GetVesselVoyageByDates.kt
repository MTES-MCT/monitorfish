package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Voyage
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoLogbookFishingTripFound
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetVesselVoyageByDates(
    private val logbookReportRepository: LogbookReportRepository,
    private val getDatesFromVesselTrackDepth: GetDatesFromVesselTrackDepth,
    private val getLogbookMessages: GetLogbookMessages,
) {
    private val logger = LoggerFactory.getLogger(GetVesselVoyageByDates::class.java)

    @Throws(BackendUsageException::class)
    fun execute(
        internalReferenceNumber: String,
        trackDepth: VesselTrackDepth,
        fromDateTime: ZonedDateTime? = null,
        toDateTime: ZonedDateTime? = null,
    ): Voyage {
        val dates =
            getDatesFromVesselTrackDepth.execute(
                internalReferenceNumber = internalReferenceNumber,
                trackDepth = trackDepth,
                fromDateTime = fromDateTime,
                toDateTime = toDateTime,
            )

        val trip =
            try {
                logbookReportRepository.findTripBetweenDates(
                    internalReferenceNumber = internalReferenceNumber,
                    afterDateTime = dates.from,
                    beforeDateTime = dates.to,
                )
            } catch (e: IllegalArgumentException) {
                throw BackendUsageException(
                    BackendUsageErrorCode.NOT_FOUND_BUT_OK,
                    message = "Could not fetch voyage for request \"${dates}\"",
                    cause = e,
                )
            } catch (e: NoLogbookFishingTripFound) {
                throw BackendUsageException(
                    BackendUsageErrorCode.NOT_FOUND_BUT_OK,
                    message = "Could not fetch voyage for request \"${dates}\"",
                    cause = e,
                )
            }

        val isLastVoyage = getIsLastVoyage(internalReferenceNumber, trip.tripNumber)
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
            totalTripsFoundForDates = trip.totalTripsFoundForDates,
            software = software,
            logbookMessages = logbookMessages,
        )
    }

    private fun getIsLastVoyage(
        internalReferenceNumber: String,
        tripNumber: String,
    ): Boolean =
        try {
            logbookReportRepository.findTripAfterTripNumber(internalReferenceNumber, tripNumber)

            false
        } catch (e: NoLogbookFishingTripFound) {
            true
        }

    private fun getIsFirstVoyage(
        internalReferenceNumber: String,
        tripNumber: String,
    ): Boolean =
        try {
            logbookReportRepository.findTripBeforeTripNumber(internalReferenceNumber, tripNumber)

            false
        } catch (e: NoLogbookFishingTripFound) {
            true
        }
}
