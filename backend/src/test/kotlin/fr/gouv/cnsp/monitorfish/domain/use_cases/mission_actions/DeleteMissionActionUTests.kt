package fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.*
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime
import java.util.*

@ExtendWith(SpringExtension::class)
class DeleteMissionActionUTests {

    @MockBean
    private lateinit var missionActionsRepository: MissionActionsRepository

    @Test
    fun `execute Should delete an action`() {
        // Given
        val action = MissionAction(
            id = null,
            vesselId = null,
            missionId = 1,
            actionDatetimeUtc = ZonedDateTime.now(),
            portLocode = "AEFAT",
            actionType = MissionActionType.LAND_CONTROL,
            gearOnboard = listOf(),
            seizureAndDiversion = true,
            isDeleted = false,
            hasSomeGearsSeized = false,
            hasSomeSpeciesSeized = false,
            closedBy = "XYZ",
            isFromPoseidon = false,
            flagState = CountryCode.FR,
            userTrigram = "LTH",
        )
        given(missionActionsRepository.findById(any())).willReturn(action)

        // When
        DeleteMissionAction(missionActionsRepository).execute(123)

        // Then
        argumentCaptor<MissionAction>().apply {
            verify(missionActionsRepository).save(capture())

            val deleted = allValues.first()
            assertThat(deleted.isDeleted).isTrue()
        }
    }
}
