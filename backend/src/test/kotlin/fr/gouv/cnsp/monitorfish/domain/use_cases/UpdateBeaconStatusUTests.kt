package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.*
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusCommentsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusesRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class UpdateBeaconStatusUTests {

    @MockBean
    private lateinit var beaconStatusesRepository: BeaconStatusesRepository

    @MockBean
    private lateinit var beaconStatusesCommentsRepository: BeaconStatusCommentsRepository

    @MockBean
    private lateinit var beaconStatusesActionRepository: BeaconStatusActionsRepository

    @MockBean
    private lateinit var getBeaconStatus: GetBeaconStatus

    @Test
    fun `execute Should throw an exception When no field to update is given`() {
        // When
        val throwable = catchThrowable {
            UpdateBeaconStatus(beaconStatusesRepository, beaconStatusesActionRepository, getBeaconStatus)
                    .execute(1, null, null)
        }

        // Then
        assertThat(throwable).isInstanceOf(IllegalArgumentException::class.java)
        assertThat(throwable.message).contains("No value to update")
    }

    @Test
    fun `execute Should return the updated beacon status When a field to update is given`() {
        // Given
        given(beaconStatusesRepository.find(any())).willReturn(BeaconStatus(1, "CFR", "EXTERNAL_IMMAT", "IRCS",
                VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA, Stage.INITIAL_ENCOUNTER,
                true, ZonedDateTime.now(), null, ZonedDateTime.now()))
        given(beaconStatusesActionRepository.findAllByBeaconStatusId(any())).willReturn(listOf(BeaconStatusAction(1, 1,
                BeaconStatusActionPropertyName.VESSEL_STATUS, "PREVIOUS", "NEXT", ZonedDateTime.now())))
        given(getBeaconStatus.execute(1))
                .willReturn(BeaconStatusResumeAndDetails(
                        beaconStatus = BeaconStatus(1, "CFR", "EXTERNAL_IMMAT", "IRCS",
                                VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA, Stage.INITIAL_ENCOUNTER,
                                true, ZonedDateTime.now(), null, ZonedDateTime.now()),
                        comments = listOf(BeaconStatusComment(1, 1, "A comment", BeaconStatusCommentUserType.SIP, ZonedDateTime.now())),
                        actions = listOf(BeaconStatusAction(1, 1, BeaconStatusActionPropertyName.VESSEL_STATUS, "PREVIOUS", "NEXT", ZonedDateTime.now()))))

        // When
        val updatedBeaconStatus = UpdateBeaconStatus(beaconStatusesRepository, beaconStatusesActionRepository, getBeaconStatus)
                .execute(1, VesselStatus.AT_SEA, null)

        // Then
        assertThat(updatedBeaconStatus.actions).hasSize(1)
    }

}
