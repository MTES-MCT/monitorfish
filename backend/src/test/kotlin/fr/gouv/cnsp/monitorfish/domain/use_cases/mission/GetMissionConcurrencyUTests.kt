package fr.gouv.cnsp.monitorfish.domain.use_cases.mission

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.mission.Mission
import fr.gouv.cnsp.monitorfish.domain.entities.mission.MissionSource
import fr.gouv.cnsp.monitorfish.domain.entities.mission.MissionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission.env_mission_action.EnvMissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.env_mission_action.EnvMissionActionType
import fr.gouv.cnsp.monitorfish.domain.entities.rapportnav.RapportNavMissionAction
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.RapportNavMissionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.TestUtils.getDummyMissionActions
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.GetMissionActions
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.ZonedDateTime
import java.util.UUID
import kotlin.system.measureTimeMillis

/**
 * The mission (MonitorEnv) and RapportNav are fetched by non-blocking HTTP calls, but the mission actions by a blocking
 * database query: it must not block the other calls.
 */
class GetMissionConcurrencyUTests {
    private val mission =
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
        )

    private val missionRepository =
        object : MissionRepository {
            override suspend fun findById(id: Int): Mission {
                delay(CALL_DELAY_MS)

                return mission
            }

            override fun findControlUnitsOfMission(
                scope: CoroutineScope,
                missionId: Int,
            ): Deferred<List<LegacyControlUnit>> = throw NotImplementedError()

            override fun findAllMissions(
                pageNumber: Int?,
                pageSize: Int?,
                startedAfterDateTime: ZonedDateTime?,
                startedBeforeDateTime: ZonedDateTime?,
                missionSources: List<String>?,
                missionTypes: List<String>?,
                missionStatuses: List<String>?,
                seaFronts: List<String>?,
            ): List<Mission> = throw NotImplementedError()

            override suspend fun findByIds(ids: List<Int>): List<Mission> = throw NotImplementedError()
        }

    private val rapportNavMissionActionsRepository =
        object : RapportNavMissionActionsRepository {
            override suspend fun findRapportNavMissionActionsById(missionId: Int): RapportNavMissionAction {
                delay(CALL_DELAY_MS)

                return RapportNavMissionAction(id = missionId, containsActionsAddedByUnit = true)
            }
        }

    private val getMissionActions: GetMissionActions = mock()

    @Test
    fun `execute Should not block the HTTP calls while querying the mission actions`() {
        // Given
        whenever(getMissionActions.execute(any())).thenAnswer {
            Thread.sleep(CALL_DELAY_MS)

            getDummyMissionActions(listOf(1, 2))
        }

        // When
        var hasRapportNavActions = false
        val elapsedMs =
            measureTimeMillis {
                // As in `MissionController`
                runBlocking {
                    hasRapportNavActions =
                        GetMission(missionRepository, getMissionActions, rapportNavMissionActionsRepository)
                            .execute(123)
                            .hasRapportNavActions
                }
            }

        // Then
        assertThat(hasRapportNavActions).isTrue
        assertThat(elapsedMs).isLessThan(CALL_DELAY_MS * 3 / 2)
    }

    companion object {
        private const val CALL_DELAY_MS = 400L
    }
}
