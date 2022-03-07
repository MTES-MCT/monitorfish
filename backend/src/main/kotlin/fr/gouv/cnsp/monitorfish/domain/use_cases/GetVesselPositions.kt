package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.entities.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoLogbookFishingTripFound
import fr.gouv.cnsp.monitorfish.domain.repositories.ERSRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetVesselPositions(private val positionRepository: PositionRepository,
                         private val ersRepository: ERSRepository) {
    private val logger: Logger = LoggerFactory.getLogger(GetVesselPositions::class.java)

    suspend fun execute(internalReferenceNumber: String,
                        externalReferenceNumber: String,
                        ircs: String,
                        trackDepth: VesselTrackDepth,
                        vesselIdentifier: VesselIdentifier,
                        fromDateTime: ZonedDateTime? = null,
                        toDateTime: ZonedDateTime? = null): Pair<Boolean, Deferred<List<Position>>> {
        var vesselTrackDepthHasBeenModified = false

        if(trackDepth == VesselTrackDepth.CUSTOM) {
            requireNotNull(fromDateTime) {
                "begin date must be not null when requesting custom track depth"
            }
            requireNotNull(toDateTime) {
                "end date must be not null when requesting custom track depth"
            }
        }

        val from = when (trackDepth) {
            VesselTrackDepth.TWELVE_HOURS -> ZonedDateTime.now().minusHours(12)
            VesselTrackDepth.LAST_DEPARTURE -> {
                try {
                    // We substract 4h to this date to ensure the track starts at the port
                    // (the departure message may be sent after the departure)
                    ersRepository.findLastTripBeforeDateTime(internalReferenceNumber, ZonedDateTime.now())
                            .startDate.minusHours(4)
                } catch (e: NoLogbookFishingTripFound) {
                    logger.warn(e.message)
                    vesselTrackDepthHasBeenModified = true
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
            VesselTrackDepth.CUSTOM -> fromDateTime
        }

        val to = when (trackDepth) {
            VesselTrackDepth.CUSTOM -> toDateTime
            else -> ZonedDateTime.now()
        }

        return coroutineScope {
            val positionsFuture = findPositionsAsync(
                    vesselIdentifier,
                    internalReferenceNumber,
                    from,
                    to,
                    ircs,
                    externalReferenceNumber)

            Pair(
                    vesselTrackDepthHasBeenModified,
                    positionsFuture
            )
        }
    }

    private fun CoroutineScope.findPositionsAsync(vesselIdentifier: VesselIdentifier,
                                                  internalReferenceNumber: String,
                                                  from: ZonedDateTime?,
                                                  to: ZonedDateTime?,
                                                  ircs: String,
                                                  externalReferenceNumber: String): Deferred<List<Position>> {
        return when (vesselIdentifier) {
            VesselIdentifier.INTERNAL_REFERENCE_NUMBER -> async { positionRepository.findVesselLastPositionsByInternalReferenceNumber(internalReferenceNumber, from!!, to!!)
                    .sortedBy { it.dateTime }}
            VesselIdentifier.IRCS -> async { positionRepository.findVesselLastPositionsByIrcs(ircs, from!!, to!!)
                    .sortedBy { it.dateTime }}
            VesselIdentifier.EXTERNAL_REFERENCE_NUMBER -> async { positionRepository.findVesselLastPositionsByExternalReferenceNumber(externalReferenceNumber, from!!, to!!)
                    .sortedBy { it.dateTime }}
        }
    }
}
