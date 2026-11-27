package fr.gouv.cnsp.monitorfish.domain.entities.vessel

import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import java.time.Clock
import java.time.Duration
import java.time.ZonedDateTime

/**
 * The time ranges in which the last VMS and AIS positions of the vessels are searched to replay them at a past date.
 */
class ReplayWindow private constructor(
    val replayedAt: ZonedDateTime,
) {
    val vmsFrom: ZonedDateTime = replayedAt.minus(VMS_LOOKBACK)
    val aisFrom: ZonedDateTime = replayedAt.minus(AIS_LOOKBACK)

    companion object {
        /** Covers beacons emitting every 1 to 4 hours. */
        val VMS_LOOKBACK: Duration = Duration.ofHours(6)

        /** AIS positions are emitted every few minutes. */
        val AIS_LOOKBACK: Duration = Duration.ofHours(1)

        fun of(
            replayedAt: ZonedDateTime,
            clock: Clock,
        ): ReplayWindow {
            if (replayedAt.isAfter(ZonedDateTime.now(clock))) {
                throw BackendUsageException(
                    BackendUsageErrorCode.FUTURE_DATE_TIME,
                    message = "Positions can only be replayed at a past date: $replayedAt.",
                )
            }

            return ReplayWindow(replayedAt)
        }
    }
}
