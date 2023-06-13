package fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions

import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.given
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Facade
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime
import java.util.*

@ExtendWith(SpringExtension::class)
class AddMissionActionUTests {

    @MockBean
    private lateinit var missionActionsRepository: MissionActionsRepository

    @MockBean
    private lateinit var getMissionActionFacade: GetMissionActionFacade

    @Test
    fun `execute Should throw an exception When the id is not null`() {
        // Given
        val action = MissionAction(
            id = 1,
            vesselId = null,
            missionId = 1,
            longitude = 45.7,
            latitude = 13.5,
            actionDatetimeUtc = ZonedDateTime.now(),
            portLocode = "AEFAT",
            actionType = MissionActionType.LAND_CONTROL,
            gearOnboard = listOf(),
            seizureAndDiversion = true,
            isDeleted = false,
        )

        // When
        val throwable = catchThrowable {
            AddMissionAction(missionActionsRepository, getMissionActionFacade).execute(action)
        }

        // Then
        assertThat(throwable).isNotNull()
        assertThat(throwable.message).isEqualTo("An action creation must have no id: the `id` must be null.")
    }

    @Test
    fun `execute Should not throw an exception When the vesselId is given in a control`() {
        // Given
        val action = MissionAction(
            id = null,
            vesselId = 1,
            missionId = 1,
            longitude = 45.7,
            latitude = 13.5,
            actionDatetimeUtc = ZonedDateTime.now(),
            portLocode = "AEFAT",
            portName = "Port name",
            actionType = MissionActionType.LAND_CONTROL,
            gearOnboard = listOf(),
            seizureAndDiversion = true,
            isDeleted = false,
        )
        given(missionActionsRepository.save(anyOrNull())).willReturn(action)
        given(getMissionActionFacade.execute(anyOrNull())).willReturn(Facade.NAMO)

        // When
        val returnedAction = AddMissionAction(missionActionsRepository, getMissionActionFacade).execute(action)

        // Then
        assertThat(returnedAction).isNotNull
        argumentCaptor<MissionAction>().apply {
            verify(missionActionsRepository).save(capture())

            assertThat(allValues.first().facade).isEqualTo("NAMO")
        }
    }
}
