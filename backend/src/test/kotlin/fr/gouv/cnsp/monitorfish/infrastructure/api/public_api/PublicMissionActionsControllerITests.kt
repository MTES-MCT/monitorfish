package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Completion
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.GetMissionActions
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.PatchMissionAction
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils
import kotlinx.coroutines.runBlocking
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.ZonedDateTime

@Import(SentryConfig::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(PublicMissionActionsController::class)])
class PublicMissionActionsControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getMissionActions: GetMissionActions

    @MockBean
    private lateinit var patchMissionAction: PatchMissionAction

    private fun <T> givenSuspended(block: suspend () -> T) = BDDMockito.given(runBlocking { block() })!!

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
                    actionDatetimeUtc = ZonedDateTime.parse("2020-10-06T16:25Z"),
                    isDeleted = false,
                    hasSomeGearsSeized = false,
                    hasSomeSpeciesSeized = false,
                    isFromPoseidon = true,
                    flagState = CountryCode.FR,
                    userTrigram = "LTH",
                    completion = Completion.TO_COMPLETE,
                ),
            ),
        )

        // When
        api.perform(get("/api/v1/mission_actions?missionId=123"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(1)))
            .andExpect(jsonPath("$[0].actionDatetimeUtc", equalTo("2020-10-06T16:25:00Z")))

        runBlocking {
            Mockito.verify(getMissionActions).execute(123)
        }
    }

    @Test
    fun `Should patch a mission action`() {
        // Given
        val dateTime = ZonedDateTime.parse("2022-05-05T03:04:05.000Z")
        val newMission = TestUtils.getDummyMissionAction(dateTime).copy(flagState = CountryCode.UNDEFINED)
        given(patchMissionAction.execute(any(), any())).willReturn(newMission)

        // When
        api.perform(
            patch("/api/v1/mission_actions/123")
                .content(
                    """
                    {
                        "observationsByUnit": "OBSERVATION",
                        "actionEndDatetimeUtc": "2024-02-01T14:29:00Z"
                    }
                    """.trimIndent(),
                )
                .contentType(MediaType.APPLICATION_JSON),
        )
            // Then
            .andExpect(status().isOk)
    }
}
