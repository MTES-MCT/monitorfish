package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Completion
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import fr.gouv.cnsp.monitorfish.fakers.PortFaker
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import org.mockito.Mockito.times
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import java.time.ZonedDateTime

@SpringBootTest(classes = [EnrichMissionAction::class])
class EnrichMissionActionUTests {
    @Autowired
    private lateinit var enrichMissionAction: EnrichMissionAction

    @MockBean
    private lateinit var portRepository: PortRepository

    val mockAction =
        MissionAction(
            id = null,
            vesselId = null,
            missionId = 1,
            actionDatetimeUtc = ZonedDateTime.now(),
            actionType = MissionActionType.LAND_CONTROL,
            gearOnboard = listOf(),
            seizureAndDiversion = true,
            isDeleted = false,
            hasSomeGearsSeized = false,
            hasSomeSpeciesSeized = false,
            isFromPoseidon = false,
            flagState = CountryCode.FR,
            userTrigram = "LTH",
            completion = Completion.TO_COMPLETE,
        )

    @Test
    fun `execute should enrich mission action with port name when port exists`() {
        // Given
        val portLocode = "FRBOD"
        val portName = "Bordeaux"
        val port = PortFaker.fakePort(countryCode = "TF", locode = portLocode, name = portName)
        val missionAction = mockAction.copy(portLocode = portLocode)

        `when`(portRepository.findByLocode(portLocode)).thenReturn(port)

        // When
        val result = enrichMissionAction.execute(missionAction)

        // Then
        assertEquals(portName, result.portName)
        verify(portRepository, times(1)).findByLocode(portLocode)
    }

    @Test
    fun `execute should set port name to null when port is not found`() {
        // Given
        val portLocode = "UNKNOWN"
        val missionAction = mockAction.copy(portLocode = portLocode)
        val exception = CodeNotFoundException("Port not found for locode: $portLocode")

        `when`(portRepository.findByLocode(portLocode)).thenThrow(exception)

        // When
        val result = enrichMissionAction.execute(missionAction)

        // Then
        assertNull(result.portName)
        verify(portRepository, times(1)).findByLocode(portLocode)
    }

    @Test
    fun `execute should return action without port name when portLocode is null`() {
        // Given
        val missionAction = mockAction.copy(portLocode = null)

        // When
        val result = enrichMissionAction.execute(missionAction)

        // Then
        assertNull(result.portName)
    }
}
