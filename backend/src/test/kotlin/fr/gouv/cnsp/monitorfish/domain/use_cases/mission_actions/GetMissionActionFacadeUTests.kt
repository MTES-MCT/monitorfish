package fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Facade
import fr.gouv.cnsp.monitorfish.domain.entities.facade.FacadeArea
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.repositories.FacadeAreasRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetMissionActionFacadeUTests {

    @MockBean
    private lateinit var facadeAreasRepository: FacadeAreasRepository

    @MockBean
    private lateinit var portRepository: PortRepository

    @Test
    fun `execute Should get the facade for a land control with a known port`() {
        // Given
        val action = MissionAction(
            id = null,
            vesselId = null,
            missionId = 1,
            actionDatetimeUtc = ZonedDateTime.now(),
            portLocode = "AEFAT",
            actionType = MissionActionType.LAND_CONTROL,
            gearOnboard = listOf(),
            seizureAndDiversion = true,
            isDeleted = false,
            hasSomeGearsSeized = false,
            hasSomeSpeciesSeized = false,
        )
        given(portRepository.find(any())).willReturn(Port("AEFAT", name = "Dummy name", facade = "NAMO"))

        // When
        val facade = GetMissionActionFacade(portRepository, facadeAreasRepository).execute(action)

        // Then
        assertThat(facade).isEqualTo(Facade.NAMO)
    }

    @Test
    fun `execute Should return null for a land control with unknown port`() {
        // Given
        val action = MissionAction(
            id = null,
            vesselId = null,
            missionId = 1,
            actionDatetimeUtc = ZonedDateTime.now(),
            portLocode = null,
            actionType = MissionActionType.LAND_CONTROL,
            gearOnboard = listOf(),
            seizureAndDiversion = true,
            isDeleted = false,
            hasSomeGearsSeized = false,
            hasSomeSpeciesSeized = false,
        )

        // When
        val facade = GetMissionActionFacade(portRepository, facadeAreasRepository).execute(action)

        // Then
        assertThat(facade).isNull()
    }

    @Test
    fun `execute Should get the facade for a sea control with coordinates`() {
        // Given
        val action = MissionAction(
            id = null,
            vesselId = null,
            missionId = 1,
            actionDatetimeUtc = ZonedDateTime.now(),
            latitude = 47.3,
            longitude = -2.6,
            actionType = MissionActionType.SEA_CONTROL,
            gearOnboard = listOf(),
            seizureAndDiversion = true,
            isDeleted = false,
            hasSomeGearsSeized = false,
            hasSomeSpeciesSeized = false,
        )
        given(facadeAreasRepository.findByIncluding(any())).willReturn(
            listOf(
                FacadeArea(
                    "NAMO",
                    GeometryFactory().createPoint(
                        Coordinate(-2.58, 55.21),
                    ),
                ),
            ),
        )

        // When
        val facade = GetMissionActionFacade(portRepository, facadeAreasRepository).execute(action)

        // Then
        assertThat(facade).isEqualTo(Facade.NAMO)
    }

    @Test
    fun `execute Should return null for a sea control with no coordinates`() {
        // Given
        val action = MissionAction(
            id = null,
            vesselId = null,
            missionId = 1,
            actionDatetimeUtc = ZonedDateTime.now(),
            latitude = null,
            longitude = null,
            actionType = MissionActionType.SEA_CONTROL,
            gearOnboard = listOf(),
            seizureAndDiversion = true,
            isDeleted = false,
            hasSomeGearsSeized = false,
            hasSomeSpeciesSeized = false,
        )

        // When
        val facade = GetMissionActionFacade(portRepository, facadeAreasRepository).execute(action)

        // Then
        assertThat(facade).isNull()
    }

    @Test
    fun `execute Should return null for a sea control with no facade found`() {
        // Given
        val action = MissionAction(
            id = null,
            vesselId = null,
            missionId = 1,
            actionDatetimeUtc = ZonedDateTime.now(),
            latitude = 47.3,
            longitude = -2.6,
            actionType = MissionActionType.SEA_CONTROL,
            gearOnboard = listOf(),
            seizureAndDiversion = true,
            isDeleted = false,
            hasSomeGearsSeized = false,
            hasSomeSpeciesSeized = false,
        )
        given(facadeAreasRepository.findByIncluding(any())).willReturn(listOf())

        // When
        val facade = GetMissionActionFacade(portRepository, facadeAreasRepository).execute(action)

        // Then
        assertThat(facade).isNull()
    }
}
