package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.facade.FacadeArea
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Completion
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.repositories.FacadeAreasRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import fr.gouv.cnsp.monitorfish.fakers.PortFaker
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetMissionActionSeafrontUTests {
    @MockBean
    private lateinit var facadeAreasRepository: FacadeAreasRepository

    @MockBean
    private lateinit var portRepository: PortRepository

    @Test
    fun `execute Should get the facade for a land control with a known port`() {
        // Given
        val action =
            MissionAction(
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
                isFromPoseidon = false,
                flagState = CountryCode.FR,
                userTrigram = "LTH",
                completion = Completion.TO_COMPLETE,
            )
        given(portRepository.findByLocode(any())).willReturn(
            PortFaker.fakePort(
                locode = "AEFAT",
                name = "Dummy name",
                facade = "NAMO",
            ),
        )

        // When
        val facade = GetMissionActionFacade(portRepository, facadeAreasRepository).execute(action)

        // Then
        assertThat(facade).isEqualTo(Seafront.NAMO)
    }

    @Test
    fun `execute Should return null for a land control with unknown port`() {
        // Given
        val action =
            MissionAction(
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
                isFromPoseidon = false,
                flagState = CountryCode.FR,
                userTrigram = "LTH",
                completion = Completion.TO_COMPLETE,
            )

        // When
        val facade = GetMissionActionFacade(portRepository, facadeAreasRepository).execute(action)

        // Then
        assertThat(facade).isNull()
    }

    @Test
    fun `execute Should get the facade for a sea control with coordinates`() {
        // Given
        val action =
            MissionAction(
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
                isFromPoseidon = false,
                flagState = CountryCode.FR,
                userTrigram = "LTH",
                completion = Completion.TO_COMPLETE,
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
        assertThat(facade).isEqualTo(Seafront.NAMO)
    }

    @Test
    fun `execute Should return null for a sea control with no coordinates`() {
        // Given
        val action =
            MissionAction(
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
                isFromPoseidon = false,
                flagState = CountryCode.FR,
                userTrigram = "LTH",
                completion = Completion.TO_COMPLETE,
            )

        // When
        val facade = GetMissionActionFacade(portRepository, facadeAreasRepository).execute(action)

        // Then
        assertThat(facade).isNull()
    }

    @Test
    fun `execute Should return null for a sea control with no facade found`() {
        // Given
        val action =
            MissionAction(
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
                isFromPoseidon = false,
                flagState = CountryCode.FR,
                userTrigram = "LTH",
                completion = Completion.TO_COMPLETE,
            )
        given(facadeAreasRepository.findByIncluding(any())).willReturn(listOf())

        // When
        val facade = GetMissionActionFacade(portRepository, facadeAreasRepository).execute(action)

        // Then
        assertThat(facade).isNull()
    }
}
