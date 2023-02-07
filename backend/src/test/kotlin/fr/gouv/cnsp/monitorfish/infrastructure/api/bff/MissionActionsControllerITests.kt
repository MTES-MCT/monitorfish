package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.config.WebSecurityConfig
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_objective.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions.AddMissionAction
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions.GetVesselControls
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions.UpdateMissionAction
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.AddMissionActionDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils
import kotlinx.coroutines.runBlocking
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.ZonedDateTime

@Import(WebSecurityConfig::class)
@WebMvcTest(value = [(MissionActionsController::class)])
class MissionActionsControllerITests {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var getVesselControls: GetVesselControls

    @MockBean
    private lateinit var addMissionAction: AddMissionAction

    @MockBean
    private lateinit var updateMissionAction: UpdateMissionAction

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    private fun <T> givenSuspended(block: suspend () -> T) = BDDMockito.given(runBlocking { block() })!!

    @Test
    fun `Should get all controls for a vessel`() {
        // Given
        givenSuspended { this.getVesselControls.execute(any(), any()) }.willReturn(
            ControlsSummary(
                1,
                3,
                4,
                5,
                listOf(MissionAction(1, 1, 1, MissionActionType.SEA_CONTROL, ZonedDateTime.now())),
            ),
        )

        // When
        mockMvc.perform(get("/bff/v1/mission_actions?vesselId=123&afterDateTime=2020-05-04T03:04:05.000Z"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.numberOfDiversions", equalTo(3)))
            .andExpect(jsonPath("$.numberOfGearSeized", equalTo(4)))
            .andExpect(jsonPath("$.numberOfSpeciesSeized", equalTo(5)))
            .andExpect(jsonPath("$.controls.length()", equalTo(1)))

        runBlocking {
            Mockito.verify(getVesselControls).execute(123, ZonedDateTime.parse("2020-05-04T03:04:05Z"))
        }
    }

    @Test
    fun `Should create a mission action`() {
        // Given
        val dateTime = ZonedDateTime.now()
        val newMission = TestUtils.getDummyMissionAction(dateTime)
        given(addMissionAction.execute(any())).willReturn(newMission)

        // When
        mockMvc.perform(
            post("/bff/v1/mission_actions")
                .content(
                    objectMapper.writeValueAsString(
                        AddMissionActionDataInput(
                            actionDatetimeUtc = ZonedDateTime.now(),
                            missionId = 2,
                            vesselId = 2,
                            actionType = MissionActionType.SEA_CONTROL,
                            logbookInfractions = """
                                [{"natinf": 27689, "comments": "Poids à bord MNZ supérieur de 50% au poids déclaré", "infractionType": "WITH_RECORD"}]
                            """.trimIndent(),
                            gearOnboard = """
                                [{"gearCode": "OTB", "declaredMesh": 60.0, "gearWasControlled": false}, {"gearCode": "OTM", "declaredMesh": 60.0, "controlledMesh": 52.8, "gearWasControlled": true}]
                            """.trimIndent(),
                        ),
                    ),
                )
                .contentType(MediaType.APPLICATION_JSON),
        )
            // Then
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.missionId", equalTo(2)))
            .andExpect(jsonPath("$.vesselId", equalTo(2)))
            .andExpect(jsonPath("$.logbookInfractions[0].infractionType", equalTo("WITH_RECORD")))
            .andExpect(jsonPath("$.logbookInfractions[0].natinf", equalTo(27689)))
            .andExpect(
                jsonPath(
                    "$.logbookInfractions[0].comments",
                    equalTo("Poids à bord MNZ supérieur de 50% au poids déclaré"),
                ),
            )
    }

    @Test
    fun `Should update a mission action`() {
        // Given
        val dateTime = ZonedDateTime.now()
        val newMission = TestUtils.getDummyMissionAction(dateTime)
        given(updateMissionAction.execute(any(), any())).willReturn(newMission)

        // When
        mockMvc.perform(
            put("/bff/v1/mission_actions/123")
                .content(
                    objectMapper.writeValueAsString(
                        AddMissionActionDataInput(
                            actionDatetimeUtc = ZonedDateTime.now(),
                            missionId = 2,
                            vesselId = 2,
                            actionType = MissionActionType.SEA_CONTROL,
                            logbookInfractions = """
                                [{"natinf": 27689, "comments": "Poids à bord MNZ supérieur de 50% au poids déclaré", "infractionType": "WITH_RECORD"}]
                            """.trimIndent(),
                            gearOnboard = """
                                [{"gearCode": "OTB", "declaredMesh": 60.0, "gearWasControlled": false}, {"gearCode": "OTM", "declaredMesh": 60.0, "controlledMesh": 52.8, "gearWasControlled": true}]
                            """.trimIndent(),
                        ),
                    ),
                )
                .contentType(MediaType.APPLICATION_JSON),
        )
            // Then
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.missionId", equalTo(2)))
            .andExpect(jsonPath("$.vesselId", equalTo(2)))
            .andExpect(jsonPath("$.logbookInfractions[0].infractionType", equalTo("WITH_RECORD")))
            .andExpect(jsonPath("$.logbookInfractions[0].natinf", equalTo(27689)))
            .andExpect(
                jsonPath(
                    "$.logbookInfractions[0].comments",
                    equalTo("Poids à bord MNZ supérieur de 50% au poids déclaré"),
                ),
            )

        runBlocking {
            Mockito.verify(updateMissionAction).execute(eq(123), any())
        }
    }
}
