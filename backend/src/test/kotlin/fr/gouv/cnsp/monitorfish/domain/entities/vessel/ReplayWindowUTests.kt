package fr.gouv.cnsp.monitorfish.domain.entities.vessel

import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import java.time.Clock
import java.time.ZoneOffset
import java.time.ZonedDateTime

class ReplayWindowUTests {
    private val now = ZonedDateTime.parse("2026-11-23T12:00:00Z")
    private val clock = Clock.fixed(now.toInstant(), ZoneOffset.UTC)

    @Test
    fun `of Should look back 6 hours for VMS and 1 hour for AIS positions`() {
        // Given
        val replayedAt = now.minusDays(2)

        // When
        val replayWindow = ReplayWindow.of(replayedAt, clock)

        // Then
        assertThat(replayWindow.replayedAt).isEqualTo(replayedAt)
        assertThat(replayWindow.vmsFrom).isEqualTo(replayedAt.minusHours(6))
        assertThat(replayWindow.aisFrom).isEqualTo(replayedAt.minusHours(1))
    }

    @Test
    fun `of Should accept the current date`() {
        assertThat(ReplayWindow.of(now, clock).replayedAt).isEqualTo(now)
    }

    @Test
    fun `of Should throw When the date is in the future`() {
        // When
        val throwable = catchThrowable { ReplayWindow.of(now.plusSeconds(1), clock) }

        // Then
        assertThat(throwable).isInstanceOf(BackendUsageException::class.java)
        assertThat((throwable as BackendUsageException).code).isEqualTo(BackendUsageErrorCode.FUTURE_DATE_TIME)
    }
}
