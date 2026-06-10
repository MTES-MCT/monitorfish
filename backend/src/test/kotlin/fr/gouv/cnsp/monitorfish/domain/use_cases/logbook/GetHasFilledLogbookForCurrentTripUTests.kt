package fr.gouv.cnsp.monitorfish.domain.use_cases.logbook

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.given
import com.nhaarman.mockitokotlin2.mock
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.CurrentTripDepAndPositionAtSea
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetHasFilledLogbookForCurrentTripUTests {
    @Mock
    private val logbookReportRepository: LogbookReportRepository = mock()

    @Test
    fun `execute Should return true if DEP message is sent after first position at sea of last trip`() {
        // Given
        given(
            logbookReportRepository.getCurrentTripDepAndPositionAtSeaDateTime(
                cfr = eq("DUMMY_CFR"),
                hoursFromNow = any(),
            ),
        ).willReturn(
            CurrentTripDepAndPositionAtSea(
                departureDateTime = ZonedDateTime.now(),
                firstPositionAtSeaOfLastTripDateTime = ZonedDateTime.now().minusHours(2),
            ),
        )

        // When
        val result = GetHasFilledLogbookForCurrentTrip(logbookReportRepository).execute("DUMMY_CFR")

        // Then
        assertThat(result).isTrue()
    }

    @Test
    fun `execute Should return false if DEP message is sent before first position at sea of last trip`() {
        // Given
        given(
            logbookReportRepository.getCurrentTripDepAndPositionAtSeaDateTime(
                cfr = eq("DUMMY_CFR"),
                hoursFromNow = any(),
            ),
        ).willReturn(
            CurrentTripDepAndPositionAtSea(
                departureDateTime = ZonedDateTime.now().minusHours(9),
                firstPositionAtSeaOfLastTripDateTime = ZonedDateTime.now(),
            ),
        )

        // When
        val result = GetHasFilledLogbookForCurrentTrip(logbookReportRepository).execute("DUMMY_CFR")

        // Then
        assertThat(result).isFalse()
    }

    @Test
    fun `execute Should return false if first position at sea of last trip is not found`() {
        // Given
        given(
            logbookReportRepository.getCurrentTripDepAndPositionAtSeaDateTime(
                cfr = eq("DUMMY_CFR"),
                hoursFromNow = any(),
            ),
        ).willReturn(
            CurrentTripDepAndPositionAtSea(
                departureDateTime = ZonedDateTime.now(),
                firstPositionAtSeaOfLastTripDateTime = null,
            ),
        )

        // When
        val result = GetHasFilledLogbookForCurrentTrip(logbookReportRepository).execute("DUMMY_CFR")

        // Then
        assertThat(result).isFalse()
    }
}
