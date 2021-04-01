package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.entities.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSLastDepartureDateFound
import fr.gouv.cnsp.monitorfish.domain.repositories.ERSRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetVessel(private val vesselRepository: VesselRepository,
                private val positionRepository: PositionRepository,
                private val ersRepository: ERSRepository) {
    private val logger: Logger = LoggerFactory.getLogger(GetVessel::class.java)

    suspend fun execute(internalReferenceNumber: String,
                        externalReferenceNumber: String,
                        ircs: String,
                        trackDepth: VesselTrackDepth): Pair<Boolean, Pair<Vessel, List<Position>>> {
        var vesselTrackDepthHasBeenModified = false

        val from = when (trackDepth) {
            VesselTrackDepth.TWELVE_HOURS -> ZonedDateTime.now().minusHours(12)
            VesselTrackDepth.LAST_DEPARTURE -> {
                try {
                    ersRepository.findLastDepartureDateAndTripNumber(
                            internalReferenceNumber,
                            externalReferenceNumber,
                            ircs).lastDepartureDate
                } catch (e: NoERSLastDepartureDateFound) {
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
        }

        return coroutineScope {
            val positionsFuture = async {
                positionRepository.findVesselLastPositions(internalReferenceNumber, externalReferenceNumber, ircs, from)
                        .sortedBy { it.dateTime }
            }
            val vesselFuture = async { vesselRepository.findVessel(internalReferenceNumber, externalReferenceNumber, ircs) }

            Pair(vesselTrackDepthHasBeenModified, Pair(vesselFuture.await(), positionsFuture.await()))
        }
    }
}
