package fr.gouv.cnsp.monitorfish.domain.use_cases.mission

import com.nhaarman.mockitokotlin2.*
import fr.gouv.cnsp.monitorfish.config.DatabaseProperties
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.TestUtils.getDummyMissionActions
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.TestUtils.getDummyMissions
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class GetAllMissionsUTests {

    @MockBean
    private lateinit var missionActionsRepository: MissionActionsRepository

    @MockBean
    private lateinit var missionRepository: MissionRepository

    @Test
    fun `execute Should get all missions When requests are chunked`() {
        // Given
        val databaseProperties = DatabaseProperties()
        databaseProperties.missionsActionsChunkSize = 5

        val missions = getDummyMissions(20)
        given(
            missionRepository.findAllMissions(
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
            ),
        ).willReturn(missions)

        val firstChunk = (1..5).toList()
        val secondChunk = (6..10).toList()
        val thirdChunk = (11..15).toList()
        val fourthChunk = (16..20).toList()
        given(missionActionsRepository.findMissionActionsIn(eq(firstChunk)))
            .willReturn(getDummyMissionActions(firstChunk))
        given(missionActionsRepository.findMissionActionsIn(eq(secondChunk)))
            .willReturn(getDummyMissionActions(secondChunk))
        given(missionActionsRepository.findMissionActionsIn(eq(thirdChunk)))
            .willReturn(getDummyMissionActions(thirdChunk))
        given(missionActionsRepository.findMissionActionsIn(eq(fourthChunk)))
            .willReturn(getDummyMissionActions(fourthChunk))

        // When
        val missionsAndActions = GetAllMissions(
            missionRepository,
            missionActionsRepository,
            databaseProperties,
        ).execute(
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
        )

        // Then
        assertThat(missionsAndActions).hasSize(20)
        assertThat(missionsAndActions.first().actions).hasSize(20)
        assertThat(missionsAndActions.last().actions).hasSize(1)
        val firstMissionActions = missionsAndActions.first().actions
        assertThat(firstMissionActions.first().actionDatetimeUtc)
            .isAfter(firstMissionActions.last().actionDatetimeUtc)

        argumentCaptor<List<Int>>().apply {
            verify(missionActionsRepository, times(4)).findMissionActionsIn(capture())

            assertThat(allValues[0]).isEqualTo(firstChunk)
            assertThat(allValues[1]).isEqualTo(secondChunk)
            assertThat(allValues[2]).isEqualTo(thirdChunk)
            assertThat(allValues[3]).isEqualTo(fourthChunk)
        }
    }
}
