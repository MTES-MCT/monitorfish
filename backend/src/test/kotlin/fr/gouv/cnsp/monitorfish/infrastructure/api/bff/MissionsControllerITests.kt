package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.mission.Mission
import fr.gouv.cnsp.monitorfish.domain.entities.mission.MissionAndActions
import fr.gouv.cnsp.monitorfish.domain.entities.mission.MissionSource
import fr.gouv.cnsp.monitorfish.domain.entities.mission.MissionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Completion
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.GetAllMissions
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.GetMission
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.dtos.InfractionFilterDTO
import kotlinx.coroutines.runBlocking
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.ZoneOffset
import java.time.ZonedDateTime

@Import(SentryConfig::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(MissionController::class)])
class MissionsControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockitoBean
    private lateinit var getAllMission: GetAllMissions

    @MockitoBean
    private lateinit var getMission: GetMission

    @Test
    fun `Should get all missions`() {
        // Given
        given {
            this.getAllMission.execute(
                pageNumber = anyOrNull(),
                pageSize = anyOrNull(),
                startedAfterDateTime = anyOrNull(),
                startedBeforeDateTime = anyOrNull(),
                missionSources = anyOrNull(),
                missionTypes = anyOrNull(),
                missionStatuses = anyOrNull(),
                seaFronts = anyOrNull(),
                infractionsFilter = anyOrNull(),
                isUnderJdp = anyOrNull(),
            )
        }.willReturn(
            listOf(
                MissionAndActions(
                    mission =
                        Mission(
                            123,
                            missionTypes = listOf(MissionType.SEA),
                            missionSource = MissionSource.MONITORFISH,
                            isGeometryComputedFromControls = false,
                            startDateTimeUtc = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
                        ),
                    actions =
                        listOf(
                            MissionAction(
                                id = 3,
                                vesselId = 1,
                                missionId = 123,
                                actionDatetimeUtc = ZonedDateTime.now(),
                                actionType = MissionActionType.SEA_CONTROL,
                                seizureAndDiversion = false,
                                speciesInfractions = listOf(),
                                isDeleted = false,
                                hasSomeGearsSeized = false,
                                hasSomeSpeciesSeized = false,
                                isFromPoseidon = false,
                                flagState = CountryCode.FR,
                                userTrigram = "LTH",
                                completion = Completion.TO_COMPLETE,
                            ),
                        ),
                ),
            ),
        )

        // When
        api
            .perform(
                get(
                    """
                    /bff/v1/missions?
                    pageNumber=1&
                    pageSize=&
                    startedAfterDateTime=2021-05-05T03:04:05.000Z&
                    startedBeforeDateTime=2022-05-05T03:04:05.000Z&
                    missionTypes=SEA,LAND&
                    missionStatus=&
                    seaFronts=MED&
                    isUnderJdp=&
                    infractions=INFRACTION_WITH_RECORD
                """.trim().replace("\\s+".toRegex(), ""),
                ),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(1)))
            .andExpect(jsonPath("$[0].isGeometryComputedFromControls", equalTo(false)))
            .andExpect(jsonPath("$[0].actions.length()", equalTo(1)))

        runBlocking {
            Mockito.verify(getAllMission).execute(
                pageNumber = 1,
                pageSize = null,
                startedAfterDateTime = ZonedDateTime.parse("2021-05-05T03:04:05.000Z"),
                startedBeforeDateTime = ZonedDateTime.parse("2022-05-05T03:04:05.000Z"),
                missionSources = null,
                missionTypes = listOf("SEA", "LAND"),
                missionStatuses = listOf(),
                seaFronts = listOf("MED"),
                infractionsFilter = listOf(InfractionFilterDTO.INFRACTION_WITH_RECORD),
                isUnderJdp = null,
            )
        }
    }

    @Test
    fun `Should get a mission`() {
        // Given
        givenSuspended {
            getMission.execute(any())
        }.willReturn(
            MissionAndActions(
                mission =
                    Mission(
                        123,
                        missionTypes = listOf(MissionType.SEA),
                        missionSource = MissionSource.MONITORFISH,
                        isGeometryComputedFromControls = false,
                        startDateTimeUtc = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
                    ),
                actions =
                    listOf(
                        MissionAction(
                            id = 3,
                            vesselId = 1,
                            missionId = 123,
                            actionDatetimeUtc = ZonedDateTime.now(),
                            actionType = MissionActionType.SEA_CONTROL,
                            seizureAndDiversion = false,
                            speciesInfractions = listOf(),
                            isDeleted = false,
                            hasSomeGearsSeized = false,
                            hasSomeSpeciesSeized = false,
                            isFromPoseidon = false,
                            completion = Completion.TO_COMPLETE,
                            flagState = CountryCode.FR,
                            userTrigram = "LTH",
                        ),
                    ),
            ),
        )

        // When
        api
            .perform(
                get("/bff/v1/missions/123"),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.isGeometryComputedFromControls", equalTo(false)))
            .andExpect(jsonPath("$.actions.length()", equalTo(1)))

        runBlocking {
            Mockito.verify(getMission).execute(
                missionId = 123,
            )
        }
    }
}
