package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.SecurityConfig
import fr.gouv.cnsp.monitorfish.domain.entities.mission.*
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.missions.GetAllMissions
import kotlinx.coroutines.runBlocking
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.ZoneOffset
import java.time.ZonedDateTime

@Import(SecurityConfig::class, OIDCProperties::class)
@WebMvcTest(value = [(MissionController::class)])
class MissionsControllerITests {

    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getAllMission: GetAllMissions

    @Test
    fun `Should get all missions`() {
        // Given
        given {
            this.getAllMission.execute(
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
            )
        }.willReturn(
            listOf(
                MissionAndActions(
                    mission = Mission(
                        123,
                        missionTypes = listOf(MissionType.SEA),
                        missionSource = MissionSource.MONITORFISH,
                        isClosed = false,
                        startDateTimeUtc = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
                    ),
                    actions = listOf(
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
                        ),
                    ),
                ),
            ),
        )

        // When
        api.perform(
            get(
                """
                    /bff/v1/missions?
                    pageNumber=1&
                    pageSize=&
                    startedAfterDateTime=2021-05-05T03:04:05.000Z&
                    startedBeforeDateTime=2022-05-05T03:04:05.000Z&
                    missionTypes=SEA,LAND&
                    missionStatus=&
                    seaFronts=MED
                """.trim().replace("\\s+".toRegex(), ""),
            ),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(1)))
            .andExpect(jsonPath("$[0].actions.length()", equalTo(1)))

        runBlocking {
            Mockito.verify(getAllMission).execute(
                1,
                null,
                ZonedDateTime.parse("2021-05-05T03:04:05.000Z"),
                ZonedDateTime.parse("2022-05-05T03:04:05.000Z"),
                null,
                listOf("SEA", "LAND"),
                listOf(),
                listOf("MED"),
            )
        }
    }
}
