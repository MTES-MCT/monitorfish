package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessagePurpose
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Completion
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.PatchableMissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.EnrichPublicMissionAction
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.EnrichedMissionAction
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.GetMissionActions
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.PatchMissionAction
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils
import kotlinx.coroutines.runBlocking
import org.assertj.core.api.Assertions.assertThat
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.ZonedDateTime
import java.util.Optional

@Import(
    MapperConfiguration::class,
    SentryConfig::class,
)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(PublicMissionActionsController::class)])
class PublicMissionActionsControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockitoBean
    private lateinit var getMissionActions: GetMissionActions

    @MockitoBean
    private lateinit var patchMissionAction: PatchMissionAction

    @MockitoBean
    private lateinit var enrichPublicMissionAction: EnrichPublicMissionAction

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
        given(enrichPublicMissionAction.execute(any())).willAnswer { invocation ->
            EnrichedMissionAction(
                missionAction = invocation.getArgument(0),
                vessel =
                    Vessel(
                        id = 1,
                        flagState = CountryCode.FR,
                        hasLogbookEsacapt = false,
                        length = 24.0,
                        vesselType = "Chalutier",
                        imo = "1234567",
                        proprietorName = "EL MALIK",
                        proprietorPhones = listOf("+33 6 45 25 14"),
                        proprietorEmails = listOf("elmalik@gmail.com"),
                        proprietorNationality = "FR",
                        proprietorAddress = "1 rue du Port, Lorient",
                        operatorName = "MARINE ARMEMENT",
                        operatorPhones = listOf("+33 6 12 34 56 78"),
                        operatorEmail = "operator@armement.fr",
                        operatorNationality = "FR",
                        operatorAddress = "2 rue du Port, Lorient",
                    ),
                tripNumber = "20210001",
                pnoReportId = "FAKE_PNO_REPORT_ID",
                pnoPurpose = LogbookMessagePurpose.LAN,
                lastDeparturePortLocode = "FRLEH",
                lastDeparturePortName = "Le Havre",
                lastDepartureDateTime = ZonedDateTime.parse("2020-10-01T08:00Z"),
            )
        }

        // When
        api
            .perform(get("/api/v1/mission_actions?missionId=123"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(1)))
            // Flattened (`@JsonUnwrapped`) base mission action fields
            .andExpect(jsonPath("$[0].actionDatetimeUtc", equalTo("2020-10-06T16:25:00Z")))
            // Vessel fields
            .andExpect(jsonPath("$[0].vesselLength", equalTo(24.0)))
            .andExpect(jsonPath("$[0].vesselType", equalTo("Chalutier")))
            .andExpect(jsonPath("$[0].imo", equalTo("1234567")))
            .andExpect(jsonPath("$[0].proprietorName", equalTo("EL MALIK")))
            .andExpect(jsonPath("$[0].proprietorPhones[0]", equalTo("+33 6 45 25 14")))
            .andExpect(jsonPath("$[0].proprietorEmails[0]", equalTo("elmalik@gmail.com")))
            .andExpect(jsonPath("$[0].proprietorNationality", equalTo("FR")))
            .andExpect(jsonPath("$[0].proprietorAddress", equalTo("1 rue du Port, Lorient")))
            .andExpect(jsonPath("$[0].chartererName", equalTo("MARINE ARMEMENT")))
            .andExpect(jsonPath("$[0].chartererPhones[0]", equalTo("+33 6 12 34 56 78")))
            .andExpect(jsonPath("$[0].chartererEmail", equalTo("operator@armement.fr")))
            .andExpect(jsonPath("$[0].chartererNationality", equalTo("FR")))
            .andExpect(jsonPath("$[0].chartererAddress", equalTo("2 rue du Port, Lorient")))
            // JPE fields
            .andExpect(jsonPath("$[0].tripNumber", equalTo("20210001")))
            .andExpect(jsonPath("$[0].pnoReportId", equalTo("FAKE_PNO_REPORT_ID")))
            .andExpect(jsonPath("$[0].pnoPurpose", equalTo("LAN")))
            .andExpect(jsonPath("$[0].lastDeparturePortLocode", equalTo("FRLEH")))
            .andExpect(jsonPath("$[0].lastDeparturePortName", equalTo("Le Havre")))
            .andExpect(jsonPath("$[0].lastDepartureDateTime", equalTo("2020-10-01T08:00:00Z")))

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
        given(enrichPublicMissionAction.execute(any())).willAnswer { invocation ->
            EnrichedMissionAction(
                missionAction = invocation.getArgument(0),
                tripNumber = "20210001",
            )
        }

        // When
        api
            .perform(
                patch("/api/v1/mission_actions/123")
                    .content(
                        """
                        {
                            "observationsByUnit": "OBSERVATION",
                            "actionEndDatetimeUtc": "2024-02-01T14:29:00Z"
                        }
                        """.trimIndent(),
                    ).contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.tripNumber", equalTo("20210001")))
    }

    @Test
    fun `Should patch a mission action with both datetimes set and observationsByUnit erased`() {
        // Given
        val dateTime = ZonedDateTime.parse("2022-05-05T03:04:05.000Z")
        val newMission = TestUtils.getDummyMissionAction(dateTime).copy(flagState = CountryCode.UNDEFINED)
        given(patchMissionAction.execute(any(), any())).willReturn(newMission)
        given(enrichPublicMissionAction.execute(any())).willAnswer { invocation ->
            EnrichedMissionAction(missionAction = invocation.getArgument(0))
        }

        // When
        api
            .perform(
                patch("/api/v1/mission_actions/123")
                    .content(
                        """
                        {
                            "observationsByUnit": null,
                            "actionDatetimeUtc": "2026-06-10T08:42:00Z",
                            "actionEndDatetimeUtc": "2026-06-10T09:30:59Z"
                        }
                        """.trimIndent(),
                    ).contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(status().isOk)

        val patchCaptor = argumentCaptor<PatchableMissionAction>()
        Mockito.verify(patchMissionAction).execute(eq(123), patchCaptor.capture())
        assertThat(patchCaptor.firstValue.actionDatetimeUtc)
            .isEqualTo(Optional.of(ZonedDateTime.parse("2026-06-10T08:42:00Z")))
        assertThat(patchCaptor.firstValue.actionEndDatetimeUtc)
            .isEqualTo(Optional.of(ZonedDateTime.parse("2026-06-10T09:30:59Z")))
        assertThat(patchCaptor.firstValue.observationsByUnit).isEqualTo(Optional.empty<String>())
    }
}
