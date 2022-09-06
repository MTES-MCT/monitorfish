package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.domain.entities.controls.*
import fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.GearRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.ControlAndInfractionIds
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetVesselControls
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.mockito.Mockito
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetVesselControlsUTests {

    @MockBean
    private lateinit var controlRepository: ControlRepository

    @MockBean
    private lateinit var infractionRepository: InfractionRepository

    @MockBean
    private lateinit var portRepository: PortRepository

    @MockBean
    private lateinit var gearRepository: GearRepository

    @Test
    fun `execute Should return the controls of a specified vessel`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        val vesselId = 1

        val gearControl = GearControl()
        gearControl.gearWasControlled = true
        gearControl.gearCode = "OTB"
        gearControl.declaredMesh = 60.0
        gearControl.controlledMesh = 58.6
        val gearControls = listOf(gearControl)

        val expectedControlsAndInfractionIds = listOf(
            ControlAndInfractionIds(
                Control(id = 1,
                    vesselId = 1,
                    portLocode = "AEFAT",
                    controlType = ControlType.LAND.value,
                    gearControls = gearControls,
                    controller = Controller(1, "Controlleur"),
                    seizure = true,
                    diversion = false,
                    escortToQuay = true),
                listOf(1)),
            ControlAndInfractionIds(
                Control(id = 1,
                    vesselId = 1,
                    controlType = ControlType.SEA.value,
                    controller = Controller(1, "Controlleur"),
                    seizure = false,
                    diversion = true,
                    escortToQuay = false),
                listOf(1, 2)),
            ControlAndInfractionIds(
                Control(id = 1,
                    vesselId = 1,
                    controlType = ControlType.SEA.value,
                    controller = Controller(1, "Controlleur"),
                    seizure = false,
                    diversion = true,
                    escortToQuay = true),
                listOf(1, 2)))
        given(controlRepository.findVesselControlsAfterDateTime(any(), any())).willReturn(expectedControlsAndInfractionIds)
        given(infractionRepository.findInfractions(listOf(1))).willReturn(listOf(Infraction(1, infractionCategory = InfractionCategory.FISHING.value)))
        given(infractionRepository.findInfractions(listOf(1, 2))).willReturn(listOf(
            Infraction(1, infractionCategory = InfractionCategory.FISHING.value), Infraction(2, infractionCategory = InfractionCategory.SECURITY.value)))
        given(portRepository.find(eq("AEFAT"))).willReturn(Port("AEFAT", "Al Jazeera Port"))
        given(gearRepository.find(eq("OTB"))).willReturn(Gear("OTB", "Chalut de fond"))

        // When
        val controlResumeAndControls = GetVesselControls(controlRepository, infractionRepository, portRepository, gearRepository).execute(vesselId, now)

        // Then
        assertThat(controlResumeAndControls.numberOfSeaControls).isEqualTo(2)
        assertThat(controlResumeAndControls.numberOfLandControls).isEqualTo(1)
        assertThat(controlResumeAndControls.numberOfAerialControls).isEqualTo(0)

        assertThat(controlResumeAndControls.numberOfDiversions).isEqualTo(2)
        assertThat(controlResumeAndControls.numberOfEscortsToQuay).isEqualTo(2)
        assertThat(controlResumeAndControls.numberOfFishingInfractions).isEqualTo(3)
        assertThat(controlResumeAndControls.numberOfSecurityInfractions).isEqualTo(2)

        assertThat(controlResumeAndControls.controls.first().portName).isEqualTo("Al Jazeera Port")
        assertThat(controlResumeAndControls.controls.first().gearControls.first().gearName).isEqualTo("Chalut de fond")

        Mockito.verify(infractionRepository).findInfractions(listOf(1))
        Mockito.verify(infractionRepository, Mockito.times(2)).findInfractions(listOf(1, 2))
    }
}
