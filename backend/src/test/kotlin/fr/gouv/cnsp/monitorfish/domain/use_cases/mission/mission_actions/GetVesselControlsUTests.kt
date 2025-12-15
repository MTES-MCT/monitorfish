package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Completion
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.GearControl
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.repositories.GearRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import fr.gouv.cnsp.monitorfish.fakers.PortFaker
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.runBlocking
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetVesselControlsUTests {
    @MockitoBean
    private lateinit var missionActionsRepository: MissionActionsRepository

    @MockitoBean
    private lateinit var missionRepository: MissionRepository

    @MockitoBean
    private lateinit var portRepository: PortRepository

    @MockitoBean
    private lateinit var infractionRepository: InfractionRepository

    @MockitoBean
    private lateinit var gearRepository: GearRepository

    @Test
    fun `execute Should return the controls of a specified vessel`() {
        runBlocking {
            // Given
            val now = ZonedDateTime.now().minusDays(1)
            val vesselId = 1

            val gearControl = GearControl()
            gearControl.gearWasControlled = true
            gearControl.gearCode = "OTB"
            gearControl.declaredMesh = 60.0
            gearControl.controlledMesh = 58.6
            gearControl.hasUncontrolledMesh = false
            val gearControls = listOf(gearControl)

            val infraction = Infraction(natinf = 12345)

            val expectedControls =
                listOf(
                    MissionAction(
                        id = 1,
                        vesselId = 1,
                        missionId = 1,
                        actionDatetimeUtc = ZonedDateTime.now(),
                        portLocode = "AEFAT",
                        actionType = MissionActionType.LAND_CONTROL,
                        gearOnboard = gearControls,
                        seizureAndDiversion = true,
                        isDeleted = false,
                        hasSomeGearsSeized = true,
                        hasSomeSpeciesSeized = false,
                        isFromPoseidon = false,
                        flagState = CountryCode.FR,
                        userTrigram = "LTH",
                        completion = Completion.TO_COMPLETE,
                    ),
                    MissionAction(
                        id = 2,
                        vesselId = 1,
                        missionId = 2,
                        actionDatetimeUtc = ZonedDateTime.now(),
                        actionType = MissionActionType.SEA_CONTROL,
                        seizureAndDiversion = false,
                        infractions = listOf(infraction),
                        isDeleted = false,
                        hasSomeGearsSeized = false,
                        hasSomeSpeciesSeized = false,
                        isFromPoseidon = false,
                        flagState = CountryCode.FR,
                        userTrigram = "LTH",
                        completion = Completion.TO_COMPLETE,
                    ),
                    MissionAction(
                        id = 3,
                        vesselId = 1,
                        missionId = 3,
                        actionDatetimeUtc = ZonedDateTime.now(),
                        actionType = MissionActionType.SEA_CONTROL,
                        seizureAndDiversion = false,
                        infractions = listOf(infraction),
                        isDeleted = false,
                        hasSomeGearsSeized = false,
                        hasSomeSpeciesSeized = false,
                        isFromPoseidon = false,
                        flagState = CountryCode.FR,
                        userTrigram = "LTH",
                        completion = Completion.TO_COMPLETE,
                    ),
                )
            given(missionActionsRepository.findVesselMissionActionsAfterDateTime(any(), any())).willReturn(
                expectedControls,
            )
            given(missionRepository.findControlUnitsOfMission(any(), any())).willReturn(
                CompletableDeferred(
                    listOf(LegacyControlUnit(123, "AECP", false, "Unit AECP", listOf())),
                ),
            )

            given(portRepository.findByLocode(eq("AEFAT"))).willReturn(
                PortFaker.fakePort(
                    locode = "AEFAT",
                    name = "Al Jazeera Port",
                ),
            )
            given(gearRepository.findByCode(eq("OTB"))).willReturn(Gear("OTB", "Chalut de fond"))

            // When
            val enrichMissionAction =
                EnrichMissionAction(
                    portRepository = portRepository,
                    infractionRepository = infractionRepository,
                )
            val controlResumeAndControls =
                GetVesselControls(
                    missionActionsRepository = missionActionsRepository,
                    gearRepository = gearRepository,
                    missionRepository = missionRepository,
                    enrichMissionAction = enrichMissionAction,
                ).execute(vesselId, now)

            // Then
            assertThat(controlResumeAndControls.numberOfDiversions).isEqualTo(1)
            assertThat(controlResumeAndControls.numberOfControlsWithSomeGearsSeized).isEqualTo(1)
            assertThat(controlResumeAndControls.numberOfControlsWithSomeSpeciesSeized).isEqualTo(0)

            assertThat(controlResumeAndControls.controls.first().portName).isEqualTo("Al Jazeera Port")
            assertThat(
                controlResumeAndControls.controls
                    .first()
                    .gearOnboard
                    .first()
                    .gearName,
            ).isEqualTo(
                "Chalut de fond",
            )
        }
    }
}
