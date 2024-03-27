package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.GearControl
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Completion
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.SpeciesInfraction
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.repositories.GearRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import kotlinx.coroutines.runBlocking
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetVesselControlsUTests {

    @MockBean
    private lateinit var missionActionsRepository: MissionActionsRepository

    @MockBean
    private lateinit var missionRepository: MissionRepository

    @MockBean
    private lateinit var portRepository: PortRepository

    @MockBean
    private lateinit var gearRepository: GearRepository

    @Test
    fun `execute Should return the controls of a specified vessel`() = runBlocking {
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

        val speciesInfraction = SpeciesInfraction()
        speciesInfraction.natinf = 12345

        val expectedControls = listOf(
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
                hasSomeGearsSeized = false,
                hasSomeSpeciesSeized = false,
                isFromPoseidon = false,
                completion = Completion.TO_COMPLETE,
            ),
            MissionAction(
                id = 2,
                vesselId = 1,
                missionId = 2,
                actionDatetimeUtc = ZonedDateTime.now(),
                actionType = MissionActionType.SEA_CONTROL,
                seizureAndDiversion = false,
                speciesInfractions = listOf(speciesInfraction),
                isDeleted = false,
                hasSomeGearsSeized = false,
                hasSomeSpeciesSeized = false,
                isFromPoseidon = false,
                completion = Completion.TO_COMPLETE,
            ),
            MissionAction(
                id = 3,
                vesselId = 1,
                missionId = 3,
                actionDatetimeUtc = ZonedDateTime.now(),
                actionType = MissionActionType.SEA_CONTROL,
                seizureAndDiversion = false,
                speciesInfractions = listOf(speciesInfraction),
                isDeleted = false,
                hasSomeGearsSeized = false,
                hasSomeSpeciesSeized = false,
                isFromPoseidon = false,
                completion = Completion.TO_COMPLETE,
            ),
        )
        given(missionActionsRepository.findVesselMissionActionsAfterDateTime(any(), any())).willReturn(
            expectedControls,
        )
        given(portRepository.find(eq("AEFAT"))).willReturn(Port("AEFAT", "Al Jazeera Port"))
        given(gearRepository.find(eq("OTB"))).willReturn(Gear("OTB", "Chalut de fond"))

        // When
        val controlResumeAndControls = GetVesselControls(
            missionActionsRepository,
            portRepository,
            gearRepository,
            missionRepository,
        ).execute(vesselId, now)

        // Then
        assertThat(controlResumeAndControls.numberOfDiversions).isEqualTo(1)
        assertThat(controlResumeAndControls.numberOfControlsWithSomeGearsSeized).isEqualTo(0)
        assertThat(controlResumeAndControls.numberOfControlsWithSomeSpeciesSeized).isEqualTo(2)

        assertThat(controlResumeAndControls.controls.first().portName).isEqualTo("Al Jazeera Port")
        assertThat(controlResumeAndControls.controls.first().gearOnboard.first().gearName).isEqualTo(
            "Chalut de fond",
        )
    }
}
