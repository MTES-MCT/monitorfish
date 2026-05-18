package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.repositories.AisPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.TestUtils.getDummyPositions
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Import
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@Import(GetDatesFromVesselTrackDepth::class)
@ExtendWith(SpringExtension::class)
class GetVesselAISPositionsUTests {
    @MockitoBean
    private lateinit var aisPositionRepository: AisPositionRepository

    @Autowired
    private lateinit var getDatesFromVesselTrackDepth: GetDatesFromVesselTrackDepth

    @MockitoBean
    private lateinit var logbookReportRepository: LogbookReportRepository

    @Test
    fun `execute Should return positions for the given MMSI`() {
        // Given
        val now = ZonedDateTime.now()
        given(aisPositionRepository.findVesselLastAisPositionsByMmsi(any(), any(), any())).willReturn(
            getDummyPositions(now),
        )

        // When
        val result =
            GetVesselAISPositions(aisPositionRepository, getDatesFromVesselTrackDepth)
                .execute(
                    mmsi = 224226850L,
                    trackDepth = VesselTrackDepth.TWELVE_HOURS,
                    fromDateTime = null,
                    toDateTime = null,
                )

        // Then
        assertThat(result).hasSize(4)
        Mockito.verify(aisPositionRepository).findVesselLastAisPositionsByMmsi(eq(224226850L), any(), any())
    }

    @Test
    fun `execute Should pass the from and to parameters to the repository When it is a CUSTOM track depth`() {
        // Given
        given(aisPositionRepository.findVesselLastAisPositionsByMmsi(any(), any(), any())).willReturn(listOf())

        // When
        val fromDateTime = ZonedDateTime.now().minusMinutes(15)
        val toDateTime = ZonedDateTime.now()
        GetVesselAISPositions(aisPositionRepository, getDatesFromVesselTrackDepth)
            .execute(
                mmsi = 224226850L,
                trackDepth = VesselTrackDepth.CUSTOM,
                fromDateTime = fromDateTime,
                toDateTime = toDateTime,
            )

        // Then
        Mockito.verify(aisPositionRepository).findVesselLastAisPositionsByMmsi(
            eq(224226850L),
            eq(fromDateTime),
            eq(toDateTime),
        )
    }

    @Test
    fun `execute Should throw an exception When fromDate is null and track depth is CUSTOM`() {
        // When
        val throwable =
            catchThrowable {
                GetVesselAISPositions(aisPositionRepository, getDatesFromVesselTrackDepth)
                    .execute(
                        mmsi = 224226850L,
                        trackDepth = VesselTrackDepth.CUSTOM,
                        fromDateTime = null,
                        toDateTime = ZonedDateTime.now(),
                    )
            }

        // Then
        assertThat(throwable).isNotNull
        assertThat(throwable.message).isEqualTo("begin date must be not null when requesting custom track depth")
    }
}
