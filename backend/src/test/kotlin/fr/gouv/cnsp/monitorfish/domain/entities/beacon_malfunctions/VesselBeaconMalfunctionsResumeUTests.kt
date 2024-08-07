package fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class VesselBeaconMalfunctionsResumeUTests {

    @Test
    fun `fromBeaconMalfunctions Should create the resume When there is some actions`() {
        // Given
        val now = ZonedDateTime.now()
        val lastBeaconDateTime = now.minusMinutes(2)
        val beaconMalfunctions = listOf(
            BeaconMalfunctionWithDetails(
                beaconMalfunction = BeaconMalfunction(
                    1, "FR224226850", "1236514", "IRCS",
                    "fr", VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA,
                    Stage.ARCHIVED, now.minusYears(2), null, now.minusYears(2),
                    beaconNumber = "123465", beaconStatusAtMalfunctionCreation = BeaconStatus.ACTIVATED, vesselId = 123,
                ),
                comments = listOf(
                    BeaconMalfunctionComment(
                        beaconMalfunctionId = 1,
                        comment = "A comment",
                        userType = BeaconMalfunctionCommentUserType.SIP,
                        dateTime = now.minusYears(2),
                    ),
                ),
                actions = listOf(
                    BeaconMalfunctionAction(
                        beaconMalfunctionId = 1,
                        propertyName = BeaconMalfunctionActionPropertyName.VESSEL_STATUS,
                        nextValue = "A VALUE",
                        previousValue = VesselStatus.AT_SEA.toString(),
                        dateTime = now.minusYears(2),
                    ),
                ),
            ),
            BeaconMalfunctionWithDetails(
                beaconMalfunction = BeaconMalfunction(
                    2, "FR224226850", "1236514", "IRCS",
                    "fr", VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA,
                    Stage.ARCHIVED, now.minusMinutes(23), null, now.minusMinutes(23),
                    beaconNumber = "123465", beaconStatusAtMalfunctionCreation = BeaconStatus.ACTIVATED, vesselId = 123,
                ),
                comments = listOf(
                    BeaconMalfunctionComment(
                        beaconMalfunctionId = 1,
                        comment = "A comment",
                        userType = BeaconMalfunctionCommentUserType.SIP,
                        dateTime = now.minusMinutes(23),
                    ),
                ),
                actions = listOf(
                    BeaconMalfunctionAction(
                        beaconMalfunctionId = 1,
                        propertyName = BeaconMalfunctionActionPropertyName.VESSEL_STATUS,
                        nextValue = "A VALUE",
                        previousValue = VesselStatus.AT_SEA.toString(),
                        dateTime = now.minusMinutes(23),
                    ),
                ),
            ),
            BeaconMalfunctionWithDetails(
                beaconMalfunction = BeaconMalfunction(
                    3, "FR224226850", "1236514", "IRCS",
                    "fr", VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA,
                    Stage.ARCHIVED, now.minusMinutes(5), null, now.minusMinutes(5),
                    beaconNumber = "123465", beaconStatusAtMalfunctionCreation = BeaconStatus.ACTIVATED, vesselId = 123,
                ),
                comments = listOf(
                    BeaconMalfunctionComment(
                        beaconMalfunctionId = 1,
                        comment = "A comment",
                        userType = BeaconMalfunctionCommentUserType.SIP,
                        dateTime = now.minusMinutes(5),
                    ),
                ),
                actions = listOf(
                    BeaconMalfunctionAction(
                        beaconMalfunctionId = 1,
                        propertyName = BeaconMalfunctionActionPropertyName.VESSEL_STATUS,
                        nextValue = "A VALUE",
                        previousValue = VesselStatus.AT_PORT.toString(),
                        dateTime = now.minusMinutes(5),
                    ),
                    BeaconMalfunctionAction(
                        beaconMalfunctionId = 1,
                        propertyName = BeaconMalfunctionActionPropertyName.VESSEL_STATUS,
                        nextValue = "A VALUE",
                        previousValue = VesselStatus.AT_SEA.toString(),
                        dateTime = now.minusMinutes(4),
                    ),
                ),
            ),
            BeaconMalfunctionWithDetails(
                beaconMalfunction = BeaconMalfunction(
                    4, "FR224226850", "1236514", "IRCS",
                    "fr", VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_PORT,
                    Stage.ARCHIVED, lastBeaconDateTime, null, lastBeaconDateTime,
                    beaconNumber = "123465", beaconStatusAtMalfunctionCreation = BeaconStatus.ACTIVATED, vesselId = 123,
                ),
                comments = listOf(
                    BeaconMalfunctionComment(
                        beaconMalfunctionId = 1,
                        comment = "A comment",
                        userType = BeaconMalfunctionCommentUserType.SIP,
                        dateTime = lastBeaconDateTime,
                    ),
                ),
                actions = listOf(
                    BeaconMalfunctionAction(
                        beaconMalfunctionId = 1,
                        propertyName = BeaconMalfunctionActionPropertyName.VESSEL_STATUS,
                        nextValue = VesselStatus.ACTIVITY_DETECTED.toString(),
                        previousValue = VesselStatus.AT_SEA.toString(),
                        dateTime = lastBeaconDateTime,
                    ),
                    BeaconMalfunctionAction(
                        beaconMalfunctionId = 1,
                        propertyName = BeaconMalfunctionActionPropertyName.VESSEL_STATUS,
                        nextValue = VesselStatus.ACTIVITY_DETECTED.toString(),
                        previousValue = VesselStatus.ACTIVITY_DETECTED.toString(),
                        dateTime = now.minusMinutes(1),
                    ),
                ),
            ),
        )

        // When
        val resume = VesselBeaconMalfunctionsResume.fromBeaconMalfunctions(beaconMalfunctions)

        // Then
        assertThat(resume.numberOfBeaconsAtSea).isEqualTo(2)
        assertThat(resume.numberOfBeaconsAtPort).isEqualTo(1)
        assertThat(resume.lastBeaconMalfunctionDateTime).isEqualTo(lastBeaconDateTime)
        assertThat(resume.lastBeaconMalfunctionVesselStatus).isEqualTo(VesselStatus.ACTIVITY_DETECTED)
    }

    @Test
    fun `fromBeaconMalfunctions Should create the resume When there is no actions`() {
        // Given
        val now = ZonedDateTime.now()
        val lastBeaconDateTime = now.minusMinutes(2)
        val beaconMalfunctions = listOf(
            BeaconMalfunctionWithDetails(
                beaconMalfunction = BeaconMalfunction(
                    1, "FR224226850", "1236514", "IRCS",
                    "fr", VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA,
                    Stage.ARCHIVED, lastBeaconDateTime, null, lastBeaconDateTime,
                    beaconNumber = "123465", beaconStatusAtMalfunctionCreation = BeaconStatus.ACTIVATED, vesselId = 123,
                ),
                comments = listOf(
                    BeaconMalfunctionComment(
                        beaconMalfunctionId = 1,
                        comment = "A comment",
                        userType = BeaconMalfunctionCommentUserType.SIP,
                        dateTime = lastBeaconDateTime,
                    ),
                ),
                actions = listOf(),
            ),
            BeaconMalfunctionWithDetails(
                beaconMalfunction = BeaconMalfunction(
                    2, "FR224226852", "1236514", "IRCS",
                    "fr", VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_PORT,
                    Stage.ARCHIVED, now, null, now,
                    beaconNumber = "123465", beaconStatusAtMalfunctionCreation = BeaconStatus.ACTIVATED, vesselId = 123,
                ),
                comments = listOf(
                    BeaconMalfunctionComment(
                        beaconMalfunctionId = 1,
                        comment = "A comment",
                        userType = BeaconMalfunctionCommentUserType.SIP,
                        dateTime = now,
                    ),
                ),
                actions = listOf(),
            ),
        )

        // When
        val resume = VesselBeaconMalfunctionsResume.fromBeaconMalfunctions(beaconMalfunctions)

        // Then
        assertThat(resume.numberOfBeaconsAtSea).isEqualTo(1)
        assertThat(resume.numberOfBeaconsAtPort).isEqualTo(1)
        assertThat(resume.lastBeaconMalfunctionDateTime).isEqualTo(now)
        assertThat(resume.lastBeaconMalfunctionVesselStatus).isEqualTo(VesselStatus.AT_PORT)
    }
}
