package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPositionAIS
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ReplayWindow
import fr.gouv.cnsp.monitorfish.domain.repositories.AisPositionRepository
import java.time.Clock
import java.time.ZonedDateTime

/**
 * Replays the AIS positions of vessels without CFR at a past date, as `GetLastPositionsAIS` does for the current ones.
 * AIS positions are kept one month (see the `ais_positions` retention policy).
 */
@UseCase
class GetAISVesselsAtDateTime(
    private val aisPositionRepository: AisPositionRepository,
    private val clock: Clock,
) {
    fun execute(dateTime: ZonedDateTime): List<LastPositionAIS> {
        val replayWindow = ReplayWindow.of(dateTime, clock)

        return aisPositionRepository
            .findLastPositionOfEachVesselBetween(replayWindow.aisFrom, replayWindow.replayedAt)
            .filter { it.cfr == null }
            .map { it.toLastPositionAIS() }
    }
}
