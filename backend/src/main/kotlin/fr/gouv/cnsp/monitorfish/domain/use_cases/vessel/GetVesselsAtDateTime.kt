package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ReplayWindow
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ReplayedVessel
import fr.gouv.cnsp.monitorfish.domain.repositories.AisPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ProducerOrganizationMembershipRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import java.time.Clock
import java.time.ZonedDateTime

/**
 * Replays the VMS positions of all vessels at a past date, merged with the AIS positions of vessels having a CFR
 * (as the `last_positions` pipeline flow does for the current positions).
 */
@UseCase
class GetVesselsAtDateTime(
    private val positionRepository: PositionRepository,
    private val aisPositionRepository: AisPositionRepository,
    private val vesselRepository: VesselRepository,
    private val producerOrganizationMembershipRepository: ProducerOrganizationMembershipRepository,
    private val clock: Clock,
) {
    fun execute(dateTime: ZonedDateTime): List<ReplayedVessel> {
        val replayWindow = ReplayWindow.of(dateTime, clock)

        val vmsPositions =
            positionRepository.findLastPositionOfEachVesselBetween(
                replayWindow.vmsFrom,
                replayWindow.replayedAt,
            )
        val aisPositionsByCfr = findAisPositionsOfVesselsWithCfr(replayWindow)

        val positions =
            mergeMoreRecentAisPositions(vmsPositions, aisPositionsByCfr) +
                findAisOnlyPositions(vmsPositions, aisPositionsByCfr)

        return attachVesselIdentities(positions)
    }

    private fun findAisPositionsOfVesselsWithCfr(replayWindow: ReplayWindow): Map<String, Position> =
        aisPositionRepository
            .findLastPositionOfEachVesselBetween(replayWindow.aisFrom, replayWindow.replayedAt)
            .mapNotNull { aisPosition -> aisPosition.cfr?.let { it to aisPosition.toPosition() } }
            .toMap()

    private fun mergeMoreRecentAisPositions(
        vmsPositions: List<Position>,
        aisPositionsByCfr: Map<String, Position>,
    ): List<Position> =
        vmsPositions.map { vmsPosition ->
            val aisPosition = vmsPosition.internalReferenceNumber?.let { aisPositionsByCfr[it] }

            if (aisPosition != null && !aisPosition.dateTime.isBefore(vmsPosition.dateTime)) {
                vmsPosition.withAisPosition(aisPosition)
            } else {
                vmsPosition
            }
        }

    private fun findAisOnlyPositions(
        vmsPositions: List<Position>,
        aisPositionsByCfr: Map<String, Position>,
    ): List<Position> {
        val vmsCfrs = vmsPositions.mapNotNull { it.internalReferenceNumber }.toSet()

        return aisPositionsByCfr.filterKeys { it !in vmsCfrs }.values.toList()
    }

    private fun attachVesselIdentities(positions: List<Position>): List<ReplayedVessel> {
        val cfrs = positions.mapNotNull { it.internalReferenceNumber }.distinct()
        val vesselsByCfr =
            vesselRepository.findVesselsByInternalReferenceNumbers(cfrs).associateBy { it.internalReferenceNumber }
        val producerOrganizationsByCfr =
            producerOrganizationMembershipRepository.findAll().associateBy { it.internalReferenceNumber }

        return positions.map { position ->
            ReplayedVessel(
                position = position,
                vessel = position.internalReferenceNumber?.let { vesselsByCfr[it] },
                producerOrganization = position.internalReferenceNumber?.let { producerOrganizationsByCfr[it] },
            )
        }
    }

    private fun Position.withAisPosition(aisPosition: Position): Position =
        copy(
            latitude = aisPosition.latitude,
            longitude = aisPosition.longitude,
            speed = aisPosition.speed,
            course = aisPosition.course,
            dateTime = aisPosition.dateTime,
            positionType = PositionType.AIS,
        )
}
