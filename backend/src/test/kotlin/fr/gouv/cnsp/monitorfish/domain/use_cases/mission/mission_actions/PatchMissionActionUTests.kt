package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.given
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Completion
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.PatchableMissionAction
import fr.gouv.cnsp.monitorfish.domain.mappers.PatchEntity
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime
import java.util.*

@ExtendWith(SpringExtension::class)
class PatchMissionActionUTests {

    @MockBean
    private lateinit var missionActionsRepository: MissionActionsRepository

    private val patchMissionAction: PatchEntity<MissionAction, PatchableMissionAction> = PatchEntity()

    @Test
    fun `execute Should patch an existing action`() {
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
            completedBy = "XYZ",
            isFromPoseidon = false,
            flagState = CountryCode.FR,
            userTrigram = "LTH",
            completion = Completion.TO_COMPLETE,
        )
        given(missionActionsRepository.findById(any())).willReturn(action)
        val expectedDateTime = ZonedDateTime.now()
        val patch = PatchableMissionAction(
            actionEndDatetimeUtc = Optional.of(expectedDateTime),
            observationsByUnit = Optional.of("An observation"),
        )

        // When
        PatchMissionAction(missionActionsRepository, patchMissionAction).execute(123, patch)

        // Then
        argumentCaptor<MissionAction>().apply {
            verify(missionActionsRepository).save(capture())

            assertThat(allValues.first().observationsByUnit).isEqualTo("An observation")
            assertThat(allValues.first().actionEndDatetimeUtc).isEqualTo(expectedDateTime)
            assertThat(allValues.first().userTrigram).isEqualTo("LTH")
            assertThat(allValues.first().actionType).isEqualTo(MissionActionType.LAND_CONTROL)
        }
    }
}
