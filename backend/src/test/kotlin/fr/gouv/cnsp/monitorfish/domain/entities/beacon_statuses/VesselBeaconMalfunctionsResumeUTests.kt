package fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses

import fr.gouv.cnsp.monitorfish.domain.entities.VesselIdentifier
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class VesselBeaconMalfunctionsResumeUTests {

    @Test
    fun `fromBeaconStatuses Should create the resume When there is some actions`() {
        // Given
        val now = ZonedDateTime.now()
        val lastBeaconDateTime = now.minusMinutes(2)
        val beaconStatuses = listOf(
                BeaconStatusWithDetails(
                        beaconStatus = BeaconStatus(1, "FR224226850", "1236514", "IRCS",
                                VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA,
                                Stage.RESUMED_TRANSMISSION, true, now.minusYears(2), null, now.minusYears(2)),
                        comments = listOf(BeaconStatusComment(
                                beaconStatusId = 1, comment = "A comment", userType = BeaconStatusCommentUserType.SIP,
                                dateTime = now.minusYears(2))),
                        actions = listOf(BeaconStatusAction(
                                beaconStatusId = 1, propertyName = BeaconStatusActionPropertyName.VESSEL_STATUS, nextValue = "A VALUE",
                                previousValue = VesselStatus.AT_SEA.toString(), dateTime = now.minusYears(2)))),
                BeaconStatusWithDetails(
                        beaconStatus = BeaconStatus(2, "FR224226850", "1236514", "IRCS",
                                VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA,
                                Stage.RESUMED_TRANSMISSION, true, now.minusMinutes(23), null, now.minusMinutes(23)),
                        comments = listOf(BeaconStatusComment(
                                beaconStatusId = 1, comment = "A comment", userType = BeaconStatusCommentUserType.SIP,
                                dateTime = now.minusMinutes(23))),
                        actions = listOf(BeaconStatusAction(
                                beaconStatusId = 1, propertyName = BeaconStatusActionPropertyName.VESSEL_STATUS, nextValue = "A VALUE",
                                previousValue = VesselStatus.AT_SEA.toString(), dateTime = now.minusMinutes(23)))),
                BeaconStatusWithDetails(
                        beaconStatus = BeaconStatus(3, "FR224226850", "1236514", "IRCS",
                                VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA,
                                Stage.RESUMED_TRANSMISSION, true, now.minusMinutes(5), null, now.minusMinutes(5)),
                        comments = listOf(BeaconStatusComment(
                                beaconStatusId = 1, comment = "A comment", userType = BeaconStatusCommentUserType.SIP,
                                dateTime = now.minusMinutes(5))),
                        actions = listOf(
                                BeaconStatusAction(
                                        beaconStatusId = 1, propertyName = BeaconStatusActionPropertyName.VESSEL_STATUS, nextValue = "A VALUE",
                                        previousValue = VesselStatus.AT_PORT.toString(), dateTime = now.minusMinutes(5)),
                                BeaconStatusAction(
                                        beaconStatusId = 1, propertyName = BeaconStatusActionPropertyName.VESSEL_STATUS, nextValue = "A VALUE",
                                        previousValue = VesselStatus.AT_SEA.toString(), dateTime = now.minusMinutes(4))
                        )),
                BeaconStatusWithDetails(
                        beaconStatus = BeaconStatus(4, "FR224226850", "1236514", "IRCS",
                                VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_PORT,
                                Stage.RESUMED_TRANSMISSION, true, lastBeaconDateTime, null, lastBeaconDateTime),
                        comments = listOf(BeaconStatusComment(
                                beaconStatusId = 1, comment = "A comment", userType = BeaconStatusCommentUserType.SIP,
                                dateTime = lastBeaconDateTime)),
                        actions = listOf(
                                BeaconStatusAction(
                                        beaconStatusId = 1, propertyName = BeaconStatusActionPropertyName.VESSEL_STATUS, nextValue = VesselStatus.ACTIVITY_DETECTED.toString(),
                                        previousValue = VesselStatus.AT_SEA.toString(), dateTime = lastBeaconDateTime),
                                BeaconStatusAction(
                                        beaconStatusId = 1, propertyName = BeaconStatusActionPropertyName.VESSEL_STATUS, nextValue = VesselStatus.TECHNICAL_STOP.toString(),
                                        previousValue = VesselStatus.ACTIVITY_DETECTED.toString(), dateTime = now.minusMinutes(1)))
                        ))

        // When
        val resume = VesselBeaconMalfunctionsResume.fromBeaconStatuses(beaconStatuses)

        // Then
        assertThat(resume.numberOfBeaconsAtSea).isEqualTo(2)
        assertThat(resume.numberOfBeaconsAtPort).isEqualTo(1)
        assertThat(resume.lastBeaconStatusDateTime).isEqualTo(lastBeaconDateTime)
        assertThat(resume.lastBeaconStatusVesselStatus).isEqualTo(VesselStatus.TECHNICAL_STOP)
    }

    @Test
    fun `fromBeaconStatuses Should create the resume When there is no actions`() {
        // Given
        val now = ZonedDateTime.now()
        val lastBeaconDateTime = now.minusMinutes(2)
        val beaconStatuses = listOf(
                BeaconStatusWithDetails(
                        beaconStatus = BeaconStatus(1, "FR224226850", "1236514", "IRCS",
                                VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA,
                                Stage.RESUMED_TRANSMISSION, true, lastBeaconDateTime, null, lastBeaconDateTime),
                        comments = listOf(BeaconStatusComment(
                                beaconStatusId = 1, comment = "A comment", userType = BeaconStatusCommentUserType.SIP,
                                dateTime = lastBeaconDateTime)),
                        actions = listOf()),
                BeaconStatusWithDetails(
                        beaconStatus = BeaconStatus(2, "FR224226852", "1236514", "IRCS",
                                VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_PORT,
                                Stage.RESUMED_TRANSMISSION, true, now, null, now),
                        comments = listOf(BeaconStatusComment(
                                beaconStatusId = 1, comment = "A comment", userType = BeaconStatusCommentUserType.SIP,
                                dateTime = now)),
                        actions = listOf()))

        // When
        val resume = VesselBeaconMalfunctionsResume.fromBeaconStatuses(beaconStatuses)

        // Then
        assertThat(resume.numberOfBeaconsAtSea).isEqualTo(1)
        assertThat(resume.numberOfBeaconsAtPort).isEqualTo(1)
        assertThat(resume.lastBeaconStatusDateTime).isEqualTo(now)
        assertThat(resume.lastBeaconStatusVesselStatus).isEqualTo(VesselStatus.AT_PORT)
    }
}
