package fr.gouv.cnsp.monitorfish.domain.entities.mission_actions

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime
import java.util.*

@ExtendWith(SpringExtension::class)
class MissionActionUTests {

    @Test
    fun `verify Should throw an exception When the vesselId is missing in a control`() {
        // Given
        val action = MissionAction(
            id = null,
            vesselId = null,
            missionId = 1,
            longitude = 45.7,
            latitude = 13.5,
            actionDatetimeUtc = ZonedDateTime.now(),
            actionType = MissionActionType.SEA_CONTROL,
            gearOnboard = listOf(),
            seizureAndDiversion = true,
            isDeleted = false,
            userTrigram = "LTH",
            hasSomeGearsSeized = false,
            hasSomeSpeciesSeized = false,
            closedBy = "XYZ",
            isFromPoseidon = false,
        )

        // When
        val throwable = catchThrowable { action.verify() }

        // Then
        assertThat(throwable).isNotNull()
        assertThat(throwable.message).isEqualTo("A control must specify a vessel: the `vesselId` must be given.")
    }

    @Test
    fun `verify Should throw an exception When the userTrigram is missing in a control`() {
        // Given
        val action = MissionAction(
            id = null,
            vesselId = 1,
            missionId = 1,
            longitude = 45.7,
            latitude = 13.5,
            actionDatetimeUtc = ZonedDateTime.now(),
            actionType = MissionActionType.SEA_CONTROL,
            gearOnboard = listOf(),
            seizureAndDiversion = true,
            isDeleted = false,
            userTrigram = null,
            hasSomeGearsSeized = false,
            hasSomeSpeciesSeized = false,
            closedBy = "XYZ",
            isFromPoseidon = false,
        )

        // When
        val throwable = catchThrowable { action.verify() }

        // Then
        assertThat(throwable).isNotNull()
        assertThat(throwable.message).isEqualTo(
            "A control must specify a user trigram: the `userTrigram` must be given.",
        )
    }

    @Test
    fun `verify Should throw an exception When the porLocode is missing in a control`() {
        // Given
        val action = MissionAction(
            id = null,
            vesselId = 1,
            missionId = 1,
            longitude = 45.7,
            latitude = 13.5,
            actionDatetimeUtc = ZonedDateTime.now(),
            portLocode = null,
            portName = "Port Name",
            actionType = MissionActionType.LAND_CONTROL,
            gearOnboard = listOf(),
            seizureAndDiversion = true,
            isDeleted = false,
            userTrigram = "LTH",
            hasSomeGearsSeized = false,
            hasSomeSpeciesSeized = false,
            closedBy = "XYZ",
            isFromPoseidon = false,
        )

        // When
        val throwable = catchThrowable { action.verify() }

        // Then
        assertThat(throwable).isNotNull()
        assertThat(throwable.message).isEqualTo("A land control must specify a port: the `portLocode` must be given.")
    }

    @Test
    fun `verify Should throw an exception When the longitude is missing in a control`() {
        // Given
        val action = MissionAction(
            id = null,
            vesselId = 1,
            missionId = 1,
            longitude = null,
            latitude = 13.5,
            actionDatetimeUtc = ZonedDateTime.now(),
            portLocode = "AEFAT",
            actionType = MissionActionType.SEA_CONTROL,
            gearOnboard = listOf(),
            seizureAndDiversion = true,
            isDeleted = false,
            userTrigram = "LTH",
            hasSomeGearsSeized = false,
            hasSomeSpeciesSeized = false,
            closedBy = "XYZ",
            isFromPoseidon = false,
        )

        // When
        val throwable = catchThrowable { action.verify() }

        // Then
        assertThat(throwable).isNotNull()
        assertThat(throwable.message).isEqualTo("A control must specify a position: the `longitude` must be given.")
    }

    @Test
    fun `verify Should throw an exception When the latitude is missing in a control`() {
        // Given
        val action = MissionAction(
            id = null,
            vesselId = 1,
            missionId = 1,
            longitude = 45.2,
            latitude = null,
            actionDatetimeUtc = ZonedDateTime.now(),
            portLocode = "AEFAT",
            actionType = MissionActionType.SEA_CONTROL,
            gearOnboard = listOf(),
            seizureAndDiversion = true,
            isDeleted = false,
            userTrigram = "LTH",
            hasSomeGearsSeized = false,
            hasSomeSpeciesSeized = false,
            closedBy = "XYZ",
            isFromPoseidon = false,
        )

        // When
        val throwable = catchThrowable { action.verify() }

        // Then
        assertThat(throwable).isNotNull()
        assertThat(throwable.message).isEqualTo("A control must specify a position: the `latitude` must be given.")
    }
}
