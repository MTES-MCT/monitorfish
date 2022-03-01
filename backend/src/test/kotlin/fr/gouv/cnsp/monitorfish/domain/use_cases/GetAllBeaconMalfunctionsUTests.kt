package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.domain.entities.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunction
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.Stage
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.VesselStatus
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetAllBeaconMalfunctionsUTests {

    @MockBean
    private lateinit var beaconMalfunctionsRepository: BeaconMalfunctionsRepository

    @MockBean
    private lateinit var lastPositionRepository: LastPositionRepository

    @Test
    fun `execute Should return the beacon statuses enriched with the risk factor found in the last position table`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        val firstPosition = LastPosition(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, riskFactor = 1.23, dateTime = now.minusHours(4), vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER)
        val secondPosition = LastPosition(null, "FR123456785", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, riskFactor = 1.54, dateTime = now.minusHours(3), vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER)
        val thirdPosition = LastPosition(null, "FR224226856", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, riskFactor = 1.98, dateTime = now.minusHours(2), vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER)
        val fourthPosition = LastPosition(null, "FR224226857", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, riskFactor = 1.24, dateTime = now.minusHours(1), vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER)
        given(lastPositionRepository.findAll()).willReturn(listOf(firstPosition, fourthPosition, secondPosition, thirdPosition))
        given(beaconMalfunctionsRepository.findAllExceptEndOfFollowUp()).willReturn(listOf(BeaconMalfunction(1, "FR224226850", "1236514", "IRCS",
                VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA, Stage.INITIAL_ENCOUNTER,
                true, ZonedDateTime.now(), null, ZonedDateTime.now())))
        given(beaconMalfunctionsRepository.findLastThirtyEndOfFollowUp()).willReturn(listOf(BeaconMalfunction(2, "FR123456785", "9876543", "IRCS",
                VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA, Stage.INITIAL_ENCOUNTER,
                true, ZonedDateTime.now(), null, ZonedDateTime.now())))

        // When
        val enrichedBeaconMalfunctions = GetAllBeaconMalfunctions(beaconMalfunctionsRepository, lastPositionRepository).execute()

        // Then
        assertThat(enrichedBeaconMalfunctions).hasSize(2)
        assertThat(enrichedBeaconMalfunctions.first().riskFactor).isEqualTo(1.23)
        assertThat(enrichedBeaconMalfunctions.first().internalReferenceNumber).isEqualTo("FR224226850")

        assertThat(enrichedBeaconMalfunctions.last().riskFactor).isEqualTo(1.54)
        assertThat(enrichedBeaconMalfunctions.last().internalReferenceNumber).isEqualTo("FR123456785")
    }
}
