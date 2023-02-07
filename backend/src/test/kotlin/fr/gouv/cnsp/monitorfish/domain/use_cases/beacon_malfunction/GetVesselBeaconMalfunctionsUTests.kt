package fr.gouv.cnsp.monitorfish.domain.use_cases.beacon_malfunction

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.*
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionCommentsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionsRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetVesselBeaconMalfunctions
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
    private lateinit var beaconMalfunctionsRepository: BeaconMalfunctionsRepository

    @MockBean
    private lateinit var beaconMalfunctionCommentsRepository: BeaconMalfunctionCommentsRepository

    @MockBean
    private lateinit var beaconMalfunctionActionsRepository: BeaconMalfunctionActionsRepository

    @Test
    fun `execute Should return the detailed beacon malfunctions for a given vessel`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        given(
            beaconMalfunctionsRepository.findAllByVesselId(
                1,
                now.minusYears(1),
            ),
        )
            .willReturn(
                listOf(
                    BeaconMalfunction(
                        1, "FR224226850", "1236514", "IRCS",
                        null, VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA, Stage.END_OF_MALFUNCTION,
                        ZonedDateTime.now(), null, ZonedDateTime.now(),
                        beaconNumber = "123465", beaconStatusAtMalfunctionCreation = BeaconStatus.ACTIVATED, vesselId = 1,
                    ),
                    BeaconMalfunction(
                        2, "FR224226850", "1236514", "IRCS",
                        null, VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA, Stage.INITIAL_ENCOUNTER,
                        ZonedDateTime.now(), null, ZonedDateTime.now(),
                        beaconNumber = "123465", beaconStatusAtMalfunctionCreation = BeaconStatus.ACTIVATED, vesselId = 1,
                    ),
                ),
            )
        given(beaconMalfunctionCommentsRepository.findAllByBeaconMalfunctionId(1)).willReturn(
            listOf(
                BeaconMalfunctionComment(
                    beaconMalfunctionId = 1,
                    comment = "A comment",
                    userType = BeaconMalfunctionCommentUserType.SIP,
                    dateTime = now,
                ),
            ),
        )
        given(beaconMalfunctionActionsRepository.findAllByBeaconMalfunctionId(1)).willReturn(
            listOf(
                BeaconMalfunctionAction(
                    beaconMalfunctionId = 1,
                    propertyName = BeaconMalfunctionActionPropertyName.VESSEL_STATUS,
                    nextValue = VesselStatus.ACTIVITY_DETECTED.toString(),
                    previousValue = VesselStatus.AT_PORT.toString(),
                    dateTime = now,
                ),
            ),
        )

        // When
        val enrichedBeaconMalfunctions = GetVesselBeaconMalfunctions(
            beaconMalfunctionsRepository,
            beaconMalfunctionCommentsRepository,
            beaconMalfunctionActionsRepository,
        )
            .execute(1, now.minusYears(1))

        // Then
        assertThat(enrichedBeaconMalfunctions.history).hasSize(1)
        assertThat(enrichedBeaconMalfunctions.history.first().beaconMalfunction.id).isEqualTo(1)
        assertThat(enrichedBeaconMalfunctions.history.first().actions).hasSize(1)
        assertThat(enrichedBeaconMalfunctions.history.first().comments).hasSize(1)
        assertThat(enrichedBeaconMalfunctions.current?.beaconMalfunction?.id).isEqualTo(2)
    }
}
