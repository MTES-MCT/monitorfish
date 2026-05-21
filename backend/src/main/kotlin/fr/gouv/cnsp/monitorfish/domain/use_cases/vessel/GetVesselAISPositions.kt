package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.repositories.AisPositionRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetVesselAISPositions(
    private val aisPositionRepository: AisPositionRepository,
    private val getDatesFromVesselTrackDepth: GetDatesFromVesselTrackDepth,
) {
    private val logger: Logger = LoggerFactory.getLogger(GetVesselAISPositions::class.java)

    fun execute(
        mmsi: Long,
        trackDepth: VesselTrackDepth,
        fromDateTime: ZonedDateTime?,
        toDateTime: ZonedDateTime?,
    ): List<Position> {
        val dates =
            getDatesFromVesselTrackDepth.execute(
                internalReferenceNumber = null,
                trackDepth = trackDepth,
                fromDateTime = fromDateTime,
                toDateTime = toDateTime,
            )

        return aisPositionRepository.findVesselLastAisPositionsByMmsi(mmsi = mmsi, from = dates.from, to = dates.to)
    }
}
