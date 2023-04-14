package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.config.WebSecurityConfig
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_objective.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions.AddMissionAction
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions.GetMissionActions
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
    private lateinit var getMissionActions: GetMissionActions

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
                listOf(
                    MissionAction(
                        1,
                        1,
                        1,
                        actionType = MissionActionType.SEA_CONTROL,
                        actionDatetimeUtc = ZonedDateTime.now(),
                    ),
                ),
            ),
        )

        // When
        mockMvc.perform(get("/bff/v1/mission_actions/controls?vesselId=123&afterDateTime=2020-05-04T03:04:05.000Z"))
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
    fun `Should get all mission actions for a mission`() {
        // Given
        givenSuspended { this.getMissionActions.execute(any()) }.willReturn(
            listOf(
                MissionAction(
                    123,
                    1,
                    1,
                    actionType = MissionActionType.SEA_CONTROL,
                    actionDatetimeUtc = ZonedDateTime.now(),
                ),
            ),
        )

        // When
        mockMvc.perform(get("/bff/v1/mission_actions?missionId=123"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(1)))

        runBlocking {
            Mockito.verify(getMissionActions).execute(123)
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
                            logbookInfractions = listOf(
                                LogbookInfraction(
                                    InfractionType.WITH_RECORD,
                                    27689,
                                    "Poids à bord MNZ supérieur de 50% au poids déclaré",
                                ),
                            ),
                            segments = listOf(
                                FleetSegment(
                                    faoAreas = listOf("25.6.9", "25.7.9"),
                                    segment = "WWSS10",
                                    segmentName = "World Wide Segment",
                                ),
                            ),
                            gearInfractions = listOf(
                                GearInfraction(InfractionType.WITH_RECORD, 27689, "Maille trop petite"),
                            ),
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

        val gearControl = GearControl()
        gearControl.declaredMesh = 60.0
        gearControl.gearCode = "OTB"
        gearControl.gearWasControlled = false
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
                            logbookInfractions = listOf(
                                LogbookInfraction(
                                    InfractionType.WITH_RECORD,
                                    27689,
                                    "Poids à bord MNZ supérieur de 50% au poids déclaré",
                                ),
                            ),
                            segments = listOf(
                                FleetSegment(
                                    faoAreas = listOf("25.6.9", "25.7.9"),
                                    segment = "WWSS10",
                                    segmentName = "World Wide Segment",
                                ),
                            ),
                            gearInfractions = listOf(
                                GearInfraction(InfractionType.WITH_RECORD, 27689, "Maille trop petite"),
                            ),
                            gearOnboard = listOf(gearControl),
                        ),
                    ),
                )
                .contentType(MediaType.APPLICATION_JSON),
        )
            // Then
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.missionId", equalTo(2)))
            .andExpect(jsonPath("$.vesselId", equalTo(2)))
            .andExpect(jsonPath("$.segments[0].faoAreas[0]", equalTo("25.6.9")))
            .andExpect(jsonPath("$.segments[0].faoAreas[1]", equalTo("25.7.9")))
            .andExpect(jsonPath("$.segments[0].segment", equalTo("WWSS10")))
            .andExpect(jsonPath("$.segments[0].segmentName", equalTo("World Wide Segment")))
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
