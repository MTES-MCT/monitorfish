package fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions

import com.neovisionaries.i18n.CountryCode
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
class UpdateMissionActionUTests {

    @MockBean
    private lateinit var missionActionsRepository: MissionActionsRepository

    @MockBean
    private lateinit var getMissionActionFacade: GetMissionActionFacade

    @Test
    fun `execute Should throw an exception When the vesselId is missing in a control`() {
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
            isFromPoseidon = false,
            flagState = CountryCode.FR,
            userTrigram = "LTH",
        )

        // When
        val throwable = catchThrowable {
            UpdateMissionAction(missionActionsRepository, getMissionActionFacade).execute(123, action)
        }

        // Then
        assertThat(throwable).isNotNull()
        assertThat(throwable.message).isEqualTo("A control must specify a vessel: the `vesselId` must be given.")
    }
}
