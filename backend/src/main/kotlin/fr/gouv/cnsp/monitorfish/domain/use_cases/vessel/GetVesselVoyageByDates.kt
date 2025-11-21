package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Voyage
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
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
        val vesselTrips = logbookReportRepository.findAllTrips(internalReferenceNumber)
        val dates =
            getDatesFromVesselTrackDepth.execute(
                internalReferenceNumber = internalReferenceNumber,
                trackDepth = trackDepth,
                fromDateTime = fromDateTime,
                toDateTime = toDateTime,
            )

        val tripsBetweenDates =
            vesselTrips.filter {
                it.startDateTime!!.isBefore(toDateTime) &&
                    it.startDateTime.isAfter(fromDateTime)
            }
        if (tripsBetweenDates.isEmpty()) {
            throw BackendUsageException(
                BackendUsageErrorCode.NOT_FOUND_BUT_OK,
                message = "Could not fetch voyage for request \"${dates}\"",
            )
        }

        var trip = tripsBetweenDates.first()

        trip =
            logbookReportRepository.findDatesOfTrip(
                internalReferenceNumber,
                trip.tripNumber,
                trip.firstOperationDateTime,
                trip.lastOperationDateTime,
            )

        val tripIndex = vesselTrips.indexOfFirst { it.tripNumber == trip.tripNumber }

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
            totalTripsFoundForDates = tripsBetweenDates.size,
            software = software,
            logbookMessages = logbookMessages,
        )
    }
}
