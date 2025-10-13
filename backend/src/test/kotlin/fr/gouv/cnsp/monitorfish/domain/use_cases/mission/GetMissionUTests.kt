package fr.gouv.cnsp.monitorfish.domain.use_cases.mission

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.mission.Mission
import fr.gouv.cnsp.monitorfish.domain.entities.mission.MissionSource
import fr.gouv.cnsp.monitorfish.domain.entities.mission.MissionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission.env_mission_action.EnvMissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.env_mission_action.EnvMissionActionType
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotFindException
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.TestUtils.getDummyMissionActions
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.GetMissionActions
import kotlinx.coroutines.runBlocking
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime
import java.util.*

@ExtendWith(SpringExtension::class)
class GetMissionUTests {
    @MockitoBean
    private lateinit var getMissionActions: GetMissionActions

    @MockitoBean
    private lateinit var missionRepository: MissionRepository

    @Test
    fun `execute Should get a mission with associated actions`() {
        // Given
        given(missionRepository.findById(any())).willReturn(
            Mission(
                id = 123,
                controlUnits = listOf(),
                missionTypes = listOf(MissionType.SEA),
                startDateTimeUtc = ZonedDateTime.now(),
                isGeometryComputedFromControls = false,
                missionSource = MissionSource.MONITORFISH,
                envActions =
                    listOf(
                        EnvMissionAction(
                            id = UUID.randomUUID(),
                            actionStartDateTimeUtc = ZonedDateTime.now(),
                            actionType = EnvMissionActionType.CONTROL,
                        ),
                    ),
            ),
        )
        given(getMissionActions.execute(any())).willReturn(getDummyMissionActions(listOf(1, 2)))

        // When
        val missionsAndActions =
            runBlocking {
                return@runBlocking GetMission(
                    missionRepository,
                    getMissionActions,
                ).execute(123)
            }

        // Then
        assertThat(missionsAndActions.mission.envActions).hasSize(1)
        assertThat(missionsAndActions.actions).hasSize(3)
    }

    @Test
    fun `execute Should throw When a mission could not be fetched`() {
        // Given
        given(missionRepository.findById(any())).willThrow(CouldNotFindException("API ERROR"))
        given(getMissionActions.execute(any())).willReturn(getDummyMissionActions(listOf(123, 456)))

        // When
        val throwable =
            catchThrowable {
                runBlocking {
                    GetMission(
                        missionRepository,
                        getMissionActions,
                    ).execute(123)
                }
            }

        // Then
        assertThat(throwable).isNotNull()
        assertThat(throwable.message).isEqualTo(
            "API ERROR",
        )
    }
}
