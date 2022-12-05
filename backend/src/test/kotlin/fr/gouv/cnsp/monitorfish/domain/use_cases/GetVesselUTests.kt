package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetVessel
import kotlinx.coroutines.runBlocking
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetVesselUTests {

    @MockBean
    private lateinit var positionRepository: PositionRepository

    @MockBean
    private lateinit var vesselRepository: VesselRepository

    @MockBean
    private lateinit var logbookReportRepository: LogbookReportRepository

    @MockBean
    private lateinit var riskFactorsRepository: RiskFactorsRepository

    @MockBean
    private lateinit var beaconRepository: BeaconRepository

    @Test
    fun `execute Should return the vessel and an ordered list of last positions for a given vessel`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        val firstPosition = Position(
            null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, false, 16.445, 48.2525, 1.8, 180.0,
            now.minusHours(
                4
            )
        )
        val secondPosition = Position(
            null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, false, 16.445, 48.2525, 1.8, 180.0,
            now.minusHours(
                3
            )
        )
        val thirdPosition = Position(
            null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, false, 16.445, 48.2525, 1.8, 180.0,
            now.minusHours(
                2
            )
        )
        val fourthPosition = Position(
            null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, false, 16.445, 48.2525, 1.8, 180.0,
            now.minusHours(
                1
            )
        )
        given(positionRepository.findVesselLastPositionsByInternalReferenceNumber(any(), any(), any())).willReturn(
            listOf(firstPosition, fourthPosition, secondPosition, thirdPosition)
        )
        given(vesselRepository.findVessel(any(), any(), any())).willReturn(Vessel(id = 123))
        given(riskFactorsRepository.findVesselRiskFactors(any())).willReturn(VesselRiskFactor(2.3, 2.0, 1.9, 3.2))
        given(beaconRepository.findBeaconNumberByVesselId(eq(123))).willReturn("A_BEACON_NUMBER")

        // When
        val pair = runBlocking {
            GetVessel(
                vesselRepository,
                positionRepository,
                logbookReportRepository,
                riskFactorsRepository,
                beaconRepository
            )
                .execute(
                    "FR224226850",
                    "",
                    "",
                    VesselTrackDepth.TWELVE_HOURS,
                    VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    null,
                    null
                )
        }

        // Then
        assertThat(pair.first).isFalse
        assertThat(pair.second.vessel?.id).isEqualTo(123)
        assertThat(pair.second.vessel?.beaconNumber).isEqualTo("A_BEACON_NUMBER")
        assertThat(pair.second.positions.first().dateTime).isEqualTo(now.minusHours(4))
        assertThat(pair.second.positions.last().dateTime).isEqualTo(now.minusHours(1))
        assertThat(pair.second.vesselRiskFactor.impactRiskFactor).isEqualTo(2.3)
        assertThat(pair.second.vesselRiskFactor.riskFactor).isEqualTo(3.2)
    }

    @Test
    fun `execute Should not throw an exception When no Vessel found ANd return null`() {
        // Given
        given(positionRepository.findVesselLastPositionsByInternalReferenceNumber(any(), any(), any())).willReturn(
            listOf()
        )
        given(vesselRepository.findVessel(any(), any(), any())).willReturn(null)
        given(riskFactorsRepository.findVesselRiskFactors(any())).willReturn(VesselRiskFactor())

        // When
        val pair = runBlocking {
            GetVessel(
                vesselRepository,
                positionRepository,
                logbookReportRepository,
                riskFactorsRepository,
                beaconRepository
            )
                .execute(
                    "FR224226850",
                    "",
                    "",
                    VesselTrackDepth.TWELVE_HOURS,
                    VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    null,
                    null
                )
        }

        // Then
        assertThat(pair.first).isFalse
        assertThat(pair.second.vessel).isNull()
    }

    @Test
    fun `execute Should not throw an exception When no beacon found`() {
        // Given
        given(positionRepository.findVesselLastPositionsByInternalReferenceNumber(any(), any(), any())).willReturn(
            listOf()
        )
        given(vesselRepository.findVessel(any(), any(), any())).willReturn(Vessel())
        given(riskFactorsRepository.findVesselRiskFactors(any())).willReturn(VesselRiskFactor())
        given(beaconRepository.findBeaconNumberByVesselId(eq(123))).willReturn(null)

        // When
        val pair = runBlocking {
            GetVessel(
                vesselRepository,
                positionRepository,
                logbookReportRepository,
                riskFactorsRepository,
                beaconRepository
            )
                .execute(
                    "FR224226850",
                    "",
                    "",
                    VesselTrackDepth.TWELVE_HOURS,
                    VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    null,
                    null
                )
        }

        // Then
        assertThat(pair.first).isFalse
        assertThat(pair.second.vessel?.beaconNumber).isNull()
    }
}
