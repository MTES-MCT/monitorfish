package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.*
import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.SecurityConfig
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.*
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.actrep.ActivityCode
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.actrep.JointDeploymentPlan
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions.dtos.ActivityReport
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions.dtos.ActivityReports
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.AddMissionActionDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils
import kotlinx.coroutines.runBlocking
import org.assertj.core.api.Assertions
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

@Import(SecurityConfig::class, OIDCProperties::class, SentryConfig::class)
@WebMvcTest(value = [(MissionActionsController::class)])
class PublicMissionActionsControllerITests {

    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getVesselControls: GetVesselControls

    @MockBean
    private lateinit var getMissionActions: GetMissionActions

    @MockBean
    private lateinit var addMissionAction: AddMissionAction

    @MockBean
    private lateinit var updateMissionAction: UpdateMissionAction

    @MockBean
    private lateinit var deleteMissionAction: DeleteMissionAction

    @MockBean
    private lateinit var getMissionAction: GetMissionAction

    @MockBean
    private lateinit var getActivityReports: GetActivityReports

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
                        isDeleted = false,
                        hasSomeGearsSeized = false,
                        hasSomeSpeciesSeized = false,
                        isFromPoseidon = true,
                    ),
                ),
            ),
        )

        // When
        api.perform(get("/bff/v1/mission_actions/controls?vesselId=123&afterDateTime=2020-05-04T03:04:05.000Z"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.numberOfDiversions", equalTo(3)))
            .andExpect(jsonPath("$.numberOfControlsWithSomeGearsSeized", equalTo(4)))
            .andExpect(jsonPath("$.numberOfControlsWithSomeSpeciesSeized", equalTo(5)))
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
                    actionDatetimeUtc = ZonedDateTime.parse("2020-10-06T16:25Z"),
                    isDeleted = false,
                    hasSomeGearsSeized = false,
                    hasSomeSpeciesSeized = false,
                    isFromPoseidon = true,
                ),
            ),
        )

        // When
        api.perform(get("/bff/v1/mission_actions?missionId=123"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(1)))
            .andExpect(jsonPath("$[0].actionDatetimeUtc", equalTo("2020-10-06T16:25:00Z")))

        runBlocking {
            Mockito.verify(getMissionActions).execute(123)
        }
    }

    @Test
    fun `Should create a mission action with a bad facade`() {
        // Given
        val dateTime = ZonedDateTime.parse("2023-04-27T16:05:00Z")
        val newMission = TestUtils.getDummyMissionAction(dateTime)
        given(addMissionAction.execute(any())).willReturn(newMission)

        // When
        api.perform(
            post("/bff/v1/mission_actions")
                .content(
                    objectMapper.writeValueAsString(
                        AddMissionActionDataInput(
                            actionDatetimeUtc = dateTime,
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
                            faoAreas = listOf("25.6.9", "25.7.9"),
                            segments = listOf(
                                FleetSegment(
                                    segment = "WWSS10",
                                    segmentName = "World Wide Segment",
                                ),
                            ),
                            gearInfractions = listOf(
                                GearInfraction(InfractionType.WITH_RECORD, 27689, "Maille trop petite"),
                            ),
                            hasSomeGearsSeized = false,
                            hasSomeSpeciesSeized = false,
                            isAdministrativeControl = true,
                            isComplianceWithWaterRegulationsControl = true,
                            isSafetyEquipmentAndStandardsComplianceControl = true,
                            isSeafarersControl = true,
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
            .andExpect(jsonPath("$.isAdministrativeControl", equalTo(true)))
            .andExpect(jsonPath("$.isComplianceWithWaterRegulationsControl", equalTo(true)))
            .andExpect(jsonPath("$.isSafetyEquipmentAndStandardsComplianceControl", equalTo(true)))
            .andExpect(jsonPath("$.isSeafarersControl", equalTo(true)))
            .andExpect(
                jsonPath(
                    "$.logbookInfractions[0].comments",
                    equalTo("Poids à bord MNZ supérieur de 50% au poids déclaré"),
                ),
            )

        argumentCaptor<MissionAction>().apply {
            verify(addMissionAction).execute(capture())

            Assertions.assertThat(allValues[0].actionDatetimeUtc.toString()).isEqualTo("2023-04-27T16:05Z")
        }
    }

    @Test
    fun `Should update a mission action`() {
        // Given
        val dateTime = ZonedDateTime.parse("2022-05-05T03:04:05.000Z")
        val newMission = TestUtils.getDummyMissionAction(dateTime)
        given(updateMissionAction.execute(any(), any())).willReturn(newMission)

        val gearControl = GearControl()
        gearControl.declaredMesh = 60.0
        gearControl.hasUncontrolledMesh = true
        gearControl.gearCode = "OTB"
        gearControl.gearWasControlled = false
        // When
        api.perform(
            put("/bff/v1/mission_actions/123")
                .content(
                    objectMapper.writeValueAsString(
                        AddMissionActionDataInput(
                            actionDatetimeUtc = dateTime,
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
                            faoAreas = listOf("25.6.9", "25.7.9"),
                            segments = listOf(
                                FleetSegment(
                                    segment = "WWSS10",
                                    segmentName = "World Wide Segment",
                                ),
                            ),
                            gearInfractions = listOf(
                                GearInfraction(InfractionType.WITH_RECORD, 27689, "Maille trop petite"),
                            ),
                            gearOnboard = listOf(gearControl),
                            hasSomeGearsSeized = false,
                            hasSomeSpeciesSeized = false,
                            isFromPoseidon = true,
                        ),
                    ),
                )
                .contentType(MediaType.APPLICATION_JSON),
        )
            // Then
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.missionId", equalTo(2)))
            .andExpect(jsonPath("$.vesselId", equalTo(2)))
            .andExpect(jsonPath("$.isFromPoseidon", equalTo(true)))
            .andExpect(jsonPath("$.actionDatetimeUtc", equalTo("2022-05-05T03:04:05Z")))
            .andExpect(jsonPath("$.faoAreas[0]", equalTo("25.6.9")))
            .andExpect(jsonPath("$.faoAreas[1]", equalTo("25.7.9")))
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

    @Test
    fun `Should delete a mission action`() {
        // When
        api.perform(delete("/bff/v1/mission_actions/2"))
            // Then
            .andExpect(status().isNoContent())

        Mockito.verify(deleteMissionAction).execute(2)
    }

    @Test
    fun `Should get all activity reports for a given date range and JDP`() {
        // Given
        given(getActivityReports.execute(any(), any(), any())).willReturn(
            ActivityReports(
                activityReports = listOf(
                    ActivityReport(
                        action = MissionAction(
                            1,
                            1,
                            1,
                            actionType = MissionActionType.SEA_CONTROL,
                            actionDatetimeUtc = ZonedDateTime.now(),
                            isDeleted = false,
                            hasSomeGearsSeized = false,
                            hasSomeSpeciesSeized = false,
                            isFromPoseidon = true,
                        ),
                        activityCode = ActivityCode.FIS,
                        vesselNationalIdentifier = "AYFR000654",
                        controlUnits = listOf(ControlUnit(1234, "DIRM", false, "Cross Etel", listOf())),
                        vessel = Vessel(
                            id = 1,
                            internalReferenceNumber = "FR00022680",
                            vesselName = "MY AWESOME VESSEL",
                            flagState = CountryCode.FR,
                            declaredFishingGears = listOf("Trémails"),
                            vesselType = "Fishing",
                            districtCode = "AY",
                        ),
                    ),
                ),
                jdpSpecies = listOf("BSS", "MAK", "LTH"),
            ),
        )

        // When
        api.perform(
            get(
                "/bff/v1/mission_actions/controls/activity_reports?beforeDateTime=2020-05-04T03:04:05.000Z&afterDateTime=2020-03-04T03:04:05.000Z&jdp=MEDITERRANEAN_AND_EASTERN_ATLANTIC",
            ),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.activityReports.length()", equalTo(1)))
            .andExpect(jsonPath("$.activityReports[0].action.id", equalTo(1)))
            .andExpect(jsonPath("$.activityReports[0].activityCode", equalTo("FIS")))
            .andExpect(jsonPath("$.activityReports[0].vesselNationalIdentifier", equalTo("AYFR000654")))
            .andExpect(jsonPath("$.activityReports[0].controlUnits[0].id", equalTo(1234)))
            .andExpect(jsonPath("$.activityReports[0].vessel.vesselId", equalTo(1)))
            .andExpect(jsonPath("$.jdpSpecies.length()", equalTo(3)))
            .andExpect(jsonPath("$.jdpSpecies[0]", equalTo("BSS")))

        Mockito.verify(getActivityReports).execute(
            ZonedDateTime.parse("2020-05-04T03:04:05Z"),
            ZonedDateTime.parse("2020-03-04T03:04:05Z"),
            JointDeploymentPlan.MEDITERRANEAN_AND_EASTERN_ATLANTIC,
        )
    }
}
