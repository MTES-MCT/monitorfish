package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoLogbookFishingTripFound
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.dtos.DatesOfVesselTrackDepth
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetDatesFromVesselTrackDepth(
    private val logbookReportRepository: LogbookReportRepository,
) {
    private val logger: Logger = LoggerFactory.getLogger(GetDatesFromVesselTrackDepth::class.java)

    fun execute(
        internalReferenceNumber: String,
        trackDepth: VesselTrackDepth,
        fromDateTime: ZonedDateTime? = null,
        toDateTime: ZonedDateTime? = null,
    ): DatesOfVesselTrackDepth {
        var isTrackDepthModified = false

        if (trackDepth == VesselTrackDepth.CUSTOM) {
            requireNotNull(fromDateTime) {
                "begin date must be not null when requesting custom track depth"
            }
            requireNotNull(toDateTime) {
                "end date must be not null when requesting custom track depth"
            }
        }

        val from =
            when (trackDepth) {
                VesselTrackDepth.TWELVE_HOURS -> ZonedDateTime.now().minusHours(12)
                VesselTrackDepth.LAST_DEPARTURE -> {
                    try {
                        // We subtract 4h to this date to ensure the track starts at the port
                        // (the departure message may be sent after the departure)
                        logbookReportRepository
                            .findFirstAcknowledgedDateOfTripBeforeDateTime(
                                internalReferenceNumber,
                                ZonedDateTime.now(),
                            ).minusHours(4)
                    } catch (e: NoLogbookFishingTripFound) {
                        logger.warn(e.message)
                        isTrackDepthModified = true
                        ZonedDateTime.now().minusDays(1)
                    }
                }
                VesselTrackDepth.ONE_DAY -> ZonedDateTime.now().minusDays(1)
                VesselTrackDepth.TWO_DAYS -> ZonedDateTime.now().minusDays(2)
                VesselTrackDepth.THREE_DAYS -> ZonedDateTime.now().minusDays(3)
                VesselTrackDepth.ONE_WEEK -> ZonedDateTime.now().minusWeeks(1)
                VesselTrackDepth.TWO_WEEK -> ZonedDateTime.now().minusWeeks(2)
                VesselTrackDepth.THREE_WEEK -> ZonedDateTime.now().minusWeeks(3)
                VesselTrackDepth.ONE_MONTH -> ZonedDateTime.now().minusMonths(1)
                VesselTrackDepth.CUSTOM -> fromDateTime!!
            }

        val to =
            when (trackDepth) {
                VesselTrackDepth.CUSTOM -> toDateTime!!
                else -> ZonedDateTime.now()
            }

        return DatesOfVesselTrackDepth(
            from = from,
            to = to,
            isTrackDepthModified = isTrackDepthModified,
        )
    }
}
