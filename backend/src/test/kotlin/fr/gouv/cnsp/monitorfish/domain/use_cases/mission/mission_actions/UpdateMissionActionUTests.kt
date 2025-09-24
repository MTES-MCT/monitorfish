package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.eq
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
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class UpdateMissionActionUTests {
    @MockBean
    private lateinit var missionActionsRepository: MissionActionsRepository

    @MockBean
    private lateinit var getMissionActionFacade: GetMissionActionFacade

    @MockBean
    private lateinit var getSpeciesFromCode: GetSpeciesFromCode

    @Test
    fun `execute Should throw an exception When the vesselId is missing in a control`() {
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

        // When
        val throwable =
            catchThrowable {
                UpdateMissionAction(
                    missionActionsRepository,
                    getMissionActionFacade,
                    getSpeciesFromCode,
                ).execute(123, action)
            }

        // Then
        assertThat(throwable).isNotNull()
        assertThat(throwable.message).isEqualTo("A control must specify a vessel: the `vesselId` must be given.")
    }

    @Test
    fun `execute Should get the previous action`() {
        // Given
        val action =
            MissionAction(
                id = 123,
                vesselId = 156,
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
        val endDate = ZonedDateTime.now()
        given(missionActionsRepository.findById(any())).willReturn(action.copy(actionEndDatetimeUtc = endDate))

        // When
        UpdateMissionAction(missionActionsRepository, getMissionActionFacade, getSpeciesFromCode).execute(123, action)

        // Then
        verify(missionActionsRepository).save(action.copy(actionEndDatetimeUtc = endDate))
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
                id = 123,
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
        given(missionActionsRepository.findById(anyOrNull())).willReturn(action)
        given(missionActionsRepository.save(anyOrNull())).willReturn(expectedActionWithSpeciesName)
        given(getMissionActionFacade.execute(anyOrNull())).willReturn(Seafront.NAMO)
        given(getSpeciesFromCode.execute(eq(speciesCode))).willReturn(species)

        // When
        val returnedAction =
            UpdateMissionAction(
                missionActionsRepository,
                getMissionActionFacade,
                getSpeciesFromCode,
            ).execute(actionId = 123, action = action)

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
