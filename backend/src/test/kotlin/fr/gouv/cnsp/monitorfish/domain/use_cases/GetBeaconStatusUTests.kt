package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.domain.entities.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.*
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusCommentsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusesRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetBeaconStatusUTests {

    @MockBean
    private lateinit var beaconStatusesRepository: BeaconStatusesRepository

    @MockBean
    private lateinit var beaconStatusCommentsRepository: BeaconStatusCommentsRepository

    @MockBean
    private lateinit var beaconStatusActionsRepository: BeaconStatusActionsRepository

    @MockBean
    private lateinit var lastPositionRepository: LastPositionRepository

    @Test
    fun `execute Should return the detailed beacon status`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        given(beaconStatusesRepository.find(1))
                .willReturn(BeaconStatus(1, "FR224226850", "1236514", "IRCS",
                        VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA, Stage.RESUMED_TRANSMISSION,
                        true, ZonedDateTime.now(), null, ZonedDateTime.now()))
        given(beaconStatusesRepository.findAllByVesselIdentifierEquals(eq(VesselIdentifier.INTERNAL_REFERENCE_NUMBER), eq("FR224226850"), any()))
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
        val beaconStatuses = GetBeaconStatus(beaconStatusesRepository, beaconStatusCommentsRepository, beaconStatusActionsRepository, lastPositionRepository)
                .execute(1)

        // Then
        assertThat(beaconStatuses.resume?.numberOfBeaconsAtSea).isEqualTo(1)
        assertThat(beaconStatuses.resume?.numberOfBeaconsAtPort).isEqualTo(1)
        assertThat(beaconStatuses.resume?.lastBeaconStatusVesselStatus).isEqualTo(VesselStatus.AT_SEA)
        assertThat(beaconStatuses.actions).hasSize(1)
        assertThat(beaconStatuses.comments).hasSize(1)
        assertThat(beaconStatuses.beaconStatus.internalReferenceNumber).isEqualTo("FR224226850")
    }
}
