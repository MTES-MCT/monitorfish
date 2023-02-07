package fr.gouv.cnsp.monitorfish.domain.use_cases.beacon_malfunction

import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.CommunicationMeans
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.*
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class ArchiveBeaconMalfunctionsUTests {

    @MockBean
    private lateinit var updateBeaconMalfunction: UpdateBeaconMalfunction

    @Test
    fun `execute Should return the updated beacon malfunction When a field to update is given`() {
        // Given
        given(updateBeaconMalfunction.execute(eq(1), eq(null), eq(Stage.ARCHIVED), eq(null)))
            .willReturn(
                BeaconMalfunctionResumeAndDetails(
                    beaconMalfunction = BeaconMalfunction(
                        1, "CFR", "EXTERNAL_IMMAT", "IRCS",
                        "fr", VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDIBULE 1", VesselStatus.AT_SEA, Stage.INITIAL_ENCOUNTER,
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
        given(updateBeaconMalfunction.execute(eq(2), eq(null), eq(Stage.ARCHIVED), eq(null)))
            .willReturn(
                BeaconMalfunctionResumeAndDetails(
                    beaconMalfunction = BeaconMalfunction(
                        2, "CFR", "EXTERNAL_IMMAT", "IRCS",
                        "fr", VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDIBULE 2", VesselStatus.AT_SEA, Stage.INITIAL_ENCOUNTER,
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
        val updatedBeaconMalfunction = ArchiveBeaconMalfunctions(updateBeaconMalfunction)
            .execute(listOf(1, 2))

        // Then
        assertThat(updatedBeaconMalfunction.first().beaconMalfunction.vesselName).isEqualTo("BIDIBULE 1")
        assertThat(updatedBeaconMalfunction.last().beaconMalfunction.vesselName).isEqualTo("BIDIBULE 2")
    }
}
