package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.domain.entities.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.*
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusCommentsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusesRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetVesselBeaconMalfunctionsUTests {

    @MockBean
    private lateinit var beaconStatusesRepository: BeaconStatusesRepository

    @MockBean
    private lateinit var beaconStatusCommentsRepository: BeaconStatusCommentsRepository

    @MockBean
    private lateinit var beaconStatusActionsRepository: BeaconStatusActionsRepository

    @Test
    fun `execute Should return the detailed beacon statuses for a given vessel`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        given(beaconStatusesRepository.findAllByVesselIdentifierEquals(VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "FR224226850", now.minusYears(1)))
                .willReturn(listOf(
                        BeaconStatus(1, "FR224226850", "1236514", "IRCS",
                                VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA, Stage.RESUMED_TRANSMISSION,
                                true, ZonedDateTime.now(), null, ZonedDateTime.now()),
                        BeaconStatus(2, "FR224226850", "1236514", "IRCS",
                                VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA, Stage.INITIAL_ENCOUNTER,
                                true, ZonedDateTime.now(), null, ZonedDateTime.now())))
        given(beaconStatusCommentsRepository.findAllByBeaconStatusId(1)).willReturn(listOf(BeaconStatusComment(
                beaconStatusId = 1, comment = "A comment", userType = BeaconStatusCommentUserType.SIP, dateTime = now)))
        given(beaconStatusActionsRepository.findAllByBeaconStatusId(1)).willReturn(listOf(BeaconStatusAction(
                beaconStatusId = 1, propertyName = BeaconStatusActionPropertyName.VESSEL_STATUS, nextValue = VesselStatus.ACTIVITY_DETECTED.toString(), previousValue = VesselStatus.AT_PORT.toString(), dateTime = now)))

        // When
        val enrichedBeaconStatuses = GetVesselBeaconMalfunctions(beaconStatusesRepository, beaconStatusCommentsRepository, beaconStatusActionsRepository)
                .execute("FR224226850", "", "", VesselIdentifier.INTERNAL_REFERENCE_NUMBER, now.minusYears(1))

        // Then
        assertThat(enrichedBeaconStatuses.history).hasSize(1)
        assertThat(enrichedBeaconStatuses.history.first().beaconStatus.id).isEqualTo(1)
        assertThat(enrichedBeaconStatuses.history.first().actions).hasSize(1)
        assertThat(enrichedBeaconStatuses.history.first().comments).hasSize(1)
        assertThat(enrichedBeaconStatuses.current?.beaconStatus?.id).isEqualTo(2)
    }
}
