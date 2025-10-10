package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.given
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Completion
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.SpeciesControl
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.species.GetSpeciesFromCode
import fr.gouv.cnsp.monitorfish.fakers.SpeciesFaker
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class AddMissionActionUTests {
    @MockitoBean
    private lateinit var missionActionsRepository: MissionActionsRepository

    @MockitoBean
    private lateinit var getMissionActionFacade: GetMissionActionFacade

    @MockitoBean
    private lateinit var getSpeciesFromCode: GetSpeciesFromCode

    @Test
    fun `execute Should throw an exception When the id is not null`() {
        // Given
        val action =
            MissionAction(
                id = 1,
                vesselId = null,
                missionId = 1,
                longitude = 45.7,
                latitude = 13.5,
                actionDatetimeUtc = ZonedDateTime.now(),
                portLocode = "AEFAT",
                actionType = MissionActionType.LAND_CONTROL,
                gearOnboard = listOf(),
                seizureAndDiversion = true,
                isDeleted = false,
                userTrigram = "LTH",
                hasSomeGearsSeized = false,
                hasSomeSpeciesSeized = false,
                completedBy = "XYZ",
                isFromPoseidon = false,
                flagState = CountryCode.FR,
                completion = Completion.TO_COMPLETE,
            )

        // When
        val throwable =
            catchThrowable {
                AddMissionAction(missionActionsRepository, getMissionActionFacade, getSpeciesFromCode).execute(action)
            }

        // Then
        assertThat(throwable).isNotNull()
        assertThat(throwable.message).isEqualTo("An action creation must have no id: the `id` must be null.")
    }

    @Test
    fun `execute Should not throw an exception When the vesselId is given in a control`() {
        // Given
        val action =
            MissionAction(
                id = null,
                vesselId = 1,
                missionId = 1,
                longitude = 45.7,
                latitude = 13.5,
                actionDatetimeUtc = ZonedDateTime.now(),
                portLocode = "AEFAT",
                portName = "Port name",
                actionType = MissionActionType.LAND_CONTROL,
                gearOnboard = listOf(),
                seizureAndDiversion = true,
                isDeleted = false,
                userTrigram = "LTH",
                hasSomeGearsSeized = false,
                hasSomeSpeciesSeized = false,
                completedBy = "XYZ",
                isFromPoseidon = false,
                flagState = CountryCode.FR,
                completion = Completion.TO_COMPLETE,
            )
        given(missionActionsRepository.save(anyOrNull())).willReturn(action)
        given(getMissionActionFacade.execute(anyOrNull())).willReturn(Seafront.NAMO)

        // When
        val returnedAction =
            AddMissionAction(
                missionActionsRepository,
                getMissionActionFacade,
                getSpeciesFromCode,
            ).execute(action)

        // Then
        assertThat(returnedAction).isNotNull
        argumentCaptor<MissionAction>().apply {
            verify(missionActionsRepository).save(capture())

            assertThat(allValues.first().facade).isEqualTo("NAMO")
        }
    }

    @Test
    fun `execute Should enrich speciesOnboard with speciesName When speciesOnboard is provided`() {
        // Given
        val speciesCode = "COD"
        val expectedSpeciesName = "Atlantic cod"
        val species = SpeciesFaker.fakeSpecies(code = speciesCode, name = expectedSpeciesName)

        val speciesControl = SpeciesControl()
        speciesControl.speciesCode = speciesCode
        speciesControl.speciesName = null // Initially null

        val expectedSpeciesControl = SpeciesControl()
        expectedSpeciesControl.speciesCode = speciesCode
        expectedSpeciesControl.speciesName = expectedSpeciesName

        val action =
            MissionAction(
                id = null,
                vesselId = 1,
                missionId = 1,
                longitude = 45.7,
                latitude = 13.5,
                actionDatetimeUtc = ZonedDateTime.now(),
                portLocode = "AEFAT",
                portName = "Port name",
                actionType = MissionActionType.LAND_CONTROL,
                gearOnboard = listOf(),
                speciesOnboard = listOf(speciesControl),
                seizureAndDiversion = true,
                isDeleted = false,
                userTrigram = "LTH",
                hasSomeGearsSeized = false,
                hasSomeSpeciesSeized = false,
                completedBy = "XYZ",
                isFromPoseidon = false,
                flagState = CountryCode.FR,
                completion = Completion.TO_COMPLETE,
            )

        val expectedActionWithSpeciesName =
            action.copy(
                facade = "NAMO",
                speciesOnboard = listOf(expectedSpeciesControl),
            )

        given(missionActionsRepository.save(anyOrNull())).willReturn(expectedActionWithSpeciesName)
        given(getMissionActionFacade.execute(anyOrNull())).willReturn(Seafront.NAMO)
        given(getSpeciesFromCode.execute(speciesCode)).willReturn(species)

        // When
        val returnedAction =
            AddMissionAction(
                missionActionsRepository,
                getMissionActionFacade,
                getSpeciesFromCode,
            ).execute(action)

        // Then
        assertThat(returnedAction).isNotNull
        assertThat(returnedAction.speciesOnboard).hasSize(1)
        assertThat(returnedAction.speciesOnboard.first().speciesName).isEqualTo(expectedSpeciesName)

        // Verify that getSpeciesFromCode was called with the correct species code
        verify(getSpeciesFromCode).execute(speciesCode)

        // Verify that the repository save was called with the enriched action
        argumentCaptor<MissionAction>().apply {
            verify(missionActionsRepository).save(capture())

            val savedAction = allValues.first()
            assertThat(savedAction.facade).isEqualTo("NAMO")
            assertThat(savedAction.speciesOnboard).hasSize(1)
            assertThat(savedAction.speciesOnboard.first().speciesName).isEqualTo(expectedSpeciesName)
        }
    }
}
