package fr.gouv.cnsp.monitorfish.domain.use_cases.beacon_malfunction

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.CommunicationMeans
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.*
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionCommentsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionsRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class UpdateBeaconMalfunctionUTests {

    @MockBean
    private lateinit var beaconMalfunctionsRepository: BeaconMalfunctionsRepository

    @MockBean
    private lateinit var beaconMalfunctionCommentsRepository: BeaconMalfunctionCommentsRepository

    @MockBean
    private lateinit var beaconMalfunctionActionRepository: BeaconMalfunctionActionsRepository

    @MockBean
    private lateinit var getBeaconMalfunction: GetBeaconMalfunction

    @Test
    fun `execute Should throw an exception When no field to update is given`() {
        // When
        val throwable = catchThrowable {
            UpdateBeaconMalfunction(
                beaconMalfunctionsRepository,
                beaconMalfunctionActionRepository,
                getBeaconMalfunction,
            )
                .execute(1, null, null, null)
        }

        // Then
        assertThat(throwable).isInstanceOf(IllegalArgumentException::class.java)
        assertThat(throwable.message).contains("No value to update")
    }

    @Test
    fun `execute Should throw an exception When the Stage is ARCHIVED but there si no endOfBeaconMalfunctionReason`() {
        // When
        val throwable = catchThrowable {
            UpdateBeaconMalfunction(
                beaconMalfunctionsRepository,
                beaconMalfunctionActionRepository,
                getBeaconMalfunction,
            )
                .execute(1, null, Stage.ARCHIVED, null)
        }

        // Then
        assertThat(throwable).isInstanceOf(IllegalArgumentException::class.java)
        assertThat(throwable.message).contains("Cannot archive malfunction without giving an endOfBeaconMalfunctionReason")
    }

    @Test
    fun `execute Should return the updated beacon malfunction When a field to update is given`() {
        // Given
        given(beaconMalfunctionsRepository.find(any())).willReturn(
            BeaconMalfunction(
                1, "CFR", "EXTERNAL_IMMAT", "IRCS",
                "fr", VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA, Stage.INITIAL_ENCOUNTER,
                ZonedDateTime.now(), null, ZonedDateTime.now(),
                beaconNumber = "123465", beaconStatusAtMalfunctionCreation = BeaconStatus.ACTIVATED, vesselId = 123,
            ),
        )
        given(beaconMalfunctionActionRepository.findAllByBeaconMalfunctionId(any())).willReturn(
            listOf(
                BeaconMalfunctionAction(
                    1,
                    1,
                    BeaconMalfunctionActionPropertyName.VESSEL_STATUS,
                    "PREVIOUS",
                    "NEXT",
                    ZonedDateTime.now(),
                ),
            ),
        )
        given(getBeaconMalfunction.execute(1))
            .willReturn(
                BeaconMalfunctionResumeAndDetails(
                    beaconMalfunction = BeaconMalfunction(
                        1, "CFR", "EXTERNAL_IMMAT", "IRCS",
                        "fr", VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA, Stage.INITIAL_ENCOUNTER,
                        ZonedDateTime.now(), null, ZonedDateTime.now(),
                        beaconNumber = "123465", beaconStatusAtMalfunctionCreation = BeaconStatus.ACTIVATED, vesselId = 123,
                    ),
                    comments = listOf(
                        BeaconMalfunctionComment(
                            1,
                            1,
                            "A comment",
                            BeaconMalfunctionCommentUserType.SIP,
                            ZonedDateTime.now(),
                        ),
                    ),
                    actions = listOf(
                        BeaconMalfunctionAction(
                            1,
                            1,
                            BeaconMalfunctionActionPropertyName.VESSEL_STATUS,
                            "PREVIOUS",
                            "NEXT",
                            ZonedDateTime.now(),
                        ),
                    ),
                    notifications = listOf(
                        BeaconMalfunctionNotifications(
                            beaconMalfunctionId = 1,
                            dateTimeUtc = ZonedDateTime.now(),
                            notificationType = BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION,
                            notifications = listOf(
                                BeaconMalfunctionNotification(
                                    id = 1, beaconMalfunctionId = 1, dateTimeUtc = ZonedDateTime.now(),
                                    notificationType = BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION,
                                    communicationMeans = CommunicationMeans.SMS,
                                    recipientFunction = BeaconMalfunctionNotificationRecipientFunction.VESSEL_CAPTAIN,
                                    recipientName = "Jack Sparrow", recipientAddressOrNumber = "0000000000",
                                    success = false, errorMessage = "This message could not be delivered",
                                ),
                            ),
                        ),
                    ),
                ),
            )

        // When
        val updatedBeaconMalfunction = UpdateBeaconMalfunction(
            beaconMalfunctionsRepository,
            beaconMalfunctionActionRepository,
            getBeaconMalfunction,
        )
            .execute(1, VesselStatus.AT_SEA, null, null)

        // Then
        assertThat(updatedBeaconMalfunction.actions).hasSize(1)
    }
}
