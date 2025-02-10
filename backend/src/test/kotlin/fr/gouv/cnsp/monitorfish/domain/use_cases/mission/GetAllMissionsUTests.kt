package fr.gouv.cnsp.monitorfish.domain.use_cases.mission

import com.nhaarman.mockitokotlin2.*
import fr.gouv.cnsp.monitorfish.config.DatabaseProperties
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.InfractionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.SpeciesInfraction
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.TestUtils.getDummyMissionActions
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.TestUtils.getDummyMissions
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.dtos.InfractionFilterDTO
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
                pageNumber = anyOrNull(),
                pageSize = anyOrNull(),
                startedAfterDateTime = anyOrNull(),
                startedBeforeDateTime = anyOrNull(),
                missionSources = anyOrNull(),
                missionTypes = anyOrNull(),
                missionStatuses = anyOrNull(),
                seaFronts = anyOrNull(),
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
        val missionsAndActions =
            GetAllMissions(
                missionRepository,
                missionActionsRepository,
                databaseProperties,
            ).execute(
                pageNumber = null,
                pageSize = null,
                startedAfterDateTime = null,
                startedBeforeDateTime = null,
                missionSources = null,
                missionTypes = null,
                missionStatuses = null,
                seaFronts = null,
                infractionsFilter = null,
                isUnderJdp = null,
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

    @Test
    fun `execute Should filter missions by isUnderJdp filter`() {
        // Given
        val databaseProperties = DatabaseProperties()
        databaseProperties.missionsActionsChunkSize = 5

        val missions = getDummyMissions(20)
        given(
            missionRepository.findAllMissions(
                pageNumber = anyOrNull(),
                pageSize = anyOrNull(),
                startedAfterDateTime = anyOrNull(),
                startedBeforeDateTime = anyOrNull(),
                missionSources = anyOrNull(),
                missionTypes = anyOrNull(),
                missionStatuses = anyOrNull(),
                seaFronts = anyOrNull(),
            ),
        ).willReturn(missions + missions.last().copy(id = 21, isUnderJdp = true))

        val firstChunk = listOf(21)
        given(missionActionsRepository.findMissionActionsIn(eq(firstChunk)))
            .willReturn(getDummyMissionActions(firstChunk))

        // When
        val missionsAndActions =
            GetAllMissions(
                missionRepository,
                missionActionsRepository,
                databaseProperties,
            ).execute(
                pageNumber = null,
                pageSize = null,
                startedAfterDateTime = null,
                startedBeforeDateTime = null,
                missionSources = null,
                missionTypes = null,
                missionStatuses = null,
                seaFronts = null,
                infractionsFilter = null,
                isUnderJdp = true,
            )

        // Then
        assertThat(missionsAndActions).hasSize(1)
        assertThat(missionsAndActions.first().actions).hasSize(1)

        argumentCaptor<List<Int>>().apply {
            verify(missionActionsRepository, times(1)).findMissionActionsIn(capture())

            assertThat(allValues[0]).isEqualTo(firstChunk)
        }
    }

    @Test
    fun `execute Should filter missions by infractions When INFRACTION_WITH_RECORD is selected`() {
        // Given
        val databaseProperties = DatabaseProperties()
        databaseProperties.missionsActionsChunkSize = 5

        val missions = getDummyMissions(20)
        given(
            missionRepository.findAllMissions(
                pageNumber = anyOrNull(),
                pageSize = anyOrNull(),
                startedAfterDateTime = anyOrNull(),
                startedBeforeDateTime = anyOrNull(),
                missionSources = anyOrNull(),
                missionTypes = anyOrNull(),
                missionStatuses = anyOrNull(),
                seaFronts = anyOrNull(),
            ),
        ).willReturn(missions)

        val firstChunk = (1..5).toList()
        val secondChunk = (6..10).toList()
        val thirdChunk = (11..15).toList()
        val fourthChunk = (16..20).toList()
        val firstChunkMissionActions = getDummyMissionActions(firstChunk)
        given(missionActionsRepository.findMissionActionsIn(eq(firstChunk)))
            .willReturn(
                listOf(
                    firstChunkMissionActions.first().copy(
                        speciesInfractions =
                            listOf(
                                SpeciesInfraction().apply {
                                    infractionType = InfractionType.WITH_RECORD
                                },
                            ),
                    ),
                ) + firstChunkMissionActions.subList(2, 5),
            )
        val secondChunkMissionActions = getDummyMissionActions(secondChunk)
        given(missionActionsRepository.findMissionActionsIn(eq(secondChunk)))
            .willReturn(
                secondChunkMissionActions +
                    secondChunkMissionActions.last().copy(
                        speciesInfractions =
                            listOf(
                                SpeciesInfraction().apply {
                                    infractionType = InfractionType.WITHOUT_RECORD
                                },
                            ),
                    ),
            )
        given(missionActionsRepository.findMissionActionsIn(eq(thirdChunk)))
            .willReturn(getDummyMissionActions(thirdChunk))
        given(missionActionsRepository.findMissionActionsIn(eq(fourthChunk)))
            .willReturn(getDummyMissionActions(fourthChunk))

        // When
        val missionsAndActions =
            GetAllMissions(
                missionRepository,
                missionActionsRepository,
                databaseProperties,
            ).execute(
                pageNumber = null,
                pageSize = null,
                startedAfterDateTime = null,
                startedBeforeDateTime = null,
                missionSources = null,
                missionTypes = null,
                missionStatuses = null,
                seaFronts = null,
                infractionsFilter = listOf(InfractionFilterDTO.INFRACTION_WITH_RECORD),
                isUnderJdp = null,
            )

        // Then
        assertThat(missionsAndActions).hasSize(1)
        assertThat(missionsAndActions.first().actions).hasSize(17)
        val firstMissionActions = missionsAndActions.first().actions
        assertThat(
            firstMissionActions.single { action ->
                action.speciesInfractions.any {
                    it.infractionType ==
                        InfractionType.WITH_RECORD
                }
            },
        ).isNotNull
    }

    @Test
    fun `execute Should filter missions by infractions When WITHOUT_INFRACTIONS is selected`() {
        // Given
        val databaseProperties = DatabaseProperties()
        databaseProperties.missionsActionsChunkSize = 5

        val missions = getDummyMissions(20)
        given(
            missionRepository.findAllMissions(
                pageNumber = anyOrNull(),
                pageSize = anyOrNull(),
                startedAfterDateTime = anyOrNull(),
                startedBeforeDateTime = anyOrNull(),
                missionSources = anyOrNull(),
                missionTypes = anyOrNull(),
                missionStatuses = anyOrNull(),
                seaFronts = anyOrNull(),
            ),
        ).willReturn(missions)

        val firstChunk = (1..5).toList()
        val secondChunk = (6..10).toList()
        val thirdChunk = (11..15).toList()
        val fourthChunk = (16..20).toList()
        val firstChunkMissionActions = getDummyMissionActions(firstChunk)
        given(missionActionsRepository.findMissionActionsIn(eq(firstChunk)))
            .willReturn(
                listOf(
                    firstChunkMissionActions.first().copy(
                        speciesInfractions =
                            listOf(
                                SpeciesInfraction().apply {
                                    infractionType = InfractionType.WITH_RECORD
                                },
                            ),
                    ),
                ) + firstChunkMissionActions.subList(2, 5),
            )
        val secondChunkMissionActions = getDummyMissionActions(secondChunk)
        given(missionActionsRepository.findMissionActionsIn(eq(secondChunk)))
            .willReturn(
                secondChunkMissionActions +
                    secondChunkMissionActions.last().copy(
                        speciesInfractions =
                            listOf(
                                SpeciesInfraction().apply {
                                    infractionType = InfractionType.WITHOUT_RECORD
                                },
                            ),
                    ),
            )
        given(missionActionsRepository.findMissionActionsIn(eq(thirdChunk)))
            .willReturn(getDummyMissionActions(thirdChunk))
        given(missionActionsRepository.findMissionActionsIn(eq(fourthChunk)))
            .willReturn(getDummyMissionActions(fourthChunk))

        // When
        val missionsAndActions =
            GetAllMissions(
                missionRepository,
                missionActionsRepository,
                databaseProperties,
            ).execute(
                pageNumber = null,
                pageSize = null,
                startedAfterDateTime = null,
                startedBeforeDateTime = null,
                missionSources = null,
                missionTypes = null,
                missionStatuses = null,
                seaFronts = null,
                infractionsFilter = listOf(InfractionFilterDTO.WITHOUT_INFRACTIONS),
                isUnderJdp = null,
            )

        // Then
        assertThat(missionsAndActions).hasSize(18)
    }
}
