package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.given
import com.nhaarman.mockitokotlin2.never
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Completion
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.SpeciesOnboardControl
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class UpdateMissionActionSpeciesOnboardUTests {
    @MockitoBean
    private lateinit var missionActionsRepository: MissionActionsRepository

    private fun getSpeciesOnboardControl(
        speciesCode: String,
        toleranceMargin: Double? = null,
    ) = SpeciesOnboardControl().also {
        it.speciesCode = speciesCode
        it.controlledWeight = 123.0
        it.toleranceMargin = toleranceMargin
    }

    private fun getMissionAction(speciesOnboard: List<SpeciesOnboardControl>) =
        MissionAction(
            id = 123,
            vesselId = null,
            missionId = 1,
            actionDatetimeUtc = ZonedDateTime.now(),
            portLocode = "AEFAT",
            actionType = MissionActionType.LAND_CONTROL,
            speciesOnboard = speciesOnboard,
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
    fun `execute Should update the tolerance margin of the targeted species only`() {
        // Given
        val action =
            getMissionAction(
                listOf(
                    getSpeciesOnboardControl("MNZ"),
                    getSpeciesOnboardControl("HKE", toleranceMargin = 5.0),
                ),
            )
        given(missionActionsRepository.findById(any())).willReturn(action)

        // When
        UpdateMissionActionSpeciesOnboard(missionActionsRepository).execute(
            id = 123,
            speciesIndex = 1,
            toleranceMargin = 12.5,
        )

        // Then
        argumentCaptor<MissionAction>().apply {
            verify(missionActionsRepository).save(capture())

            val savedSpeciesOnboard = allValues.first().speciesOnboard
            assertThat(savedSpeciesOnboard).hasSize(2)
            assertThat(savedSpeciesOnboard.first().speciesCode).isEqualTo("MNZ")
            assertThat(savedSpeciesOnboard.first().toleranceMargin).isNull()
            assertThat(savedSpeciesOnboard.last().speciesCode).isEqualTo("HKE")
            assertThat(savedSpeciesOnboard.last().toleranceMargin).isEqualTo(12.5)
            assertThat(savedSpeciesOnboard.last().controlledWeight).isEqualTo(123.0)
        }
    }

    @Test
    fun `execute Should erase the tolerance margin When it is null`() {
        // Given
        val action = getMissionAction(listOf(getSpeciesOnboardControl("MNZ", toleranceMargin = 5.0)))
        given(missionActionsRepository.findById(any())).willReturn(action)

        // When
        UpdateMissionActionSpeciesOnboard(missionActionsRepository).execute(
            id = 123,
            speciesIndex = 0,
            toleranceMargin = null,
        )

        // Then
        argumentCaptor<MissionAction>().apply {
            verify(missionActionsRepository).save(capture())

            assertThat(
                allValues
                    .first()
                    .speciesOnboard
                    .first()
                    .toleranceMargin,
            ).isNull()
        }
    }

    @Test
    fun `execute Should throw a NOT_FOUND exception When the action is not found`() {
        // Given
        given(missionActionsRepository.findById(any())).willThrow(NoSuchElementException("No value present"))

        // When
        val throwable =
            catchBackendUsageException {
                UpdateMissionActionSpeciesOnboard(missionActionsRepository).execute(
                    id = 123,
                    speciesIndex = 0,
                    toleranceMargin = 12.5,
                )
            }

        // Then
        assertThat(throwable.code).isEqualTo(BackendUsageErrorCode.NOT_FOUND)
        verify(missionActionsRepository, never()).save(any())
    }

    @Test
    fun `execute Should throw a NOT_FOUND exception When the species index is out of range`() {
        // Given
        val action = getMissionAction(listOf(getSpeciesOnboardControl("MNZ")))
        given(missionActionsRepository.findById(any())).willReturn(action)

        // When
        val throwable =
            catchBackendUsageException {
                UpdateMissionActionSpeciesOnboard(missionActionsRepository).execute(
                    id = 123,
                    speciesIndex = 1,
                    toleranceMargin = 12.5,
                )
            }

        // Then
        assertThat(throwable.code).isEqualTo(BackendUsageErrorCode.NOT_FOUND)
        assertThat(throwable.message).isEqualTo("Species index 1 not found in action 123")
        verify(missionActionsRepository, never()).save(any())
    }

    @Test
    fun `execute Should throw a COULD_NOT_UPDATE exception When the save failed`() {
        // Given
        val action = getMissionAction(listOf(getSpeciesOnboardControl("MNZ")))
        given(missionActionsRepository.findById(any())).willReturn(action)
        given(missionActionsRepository.save(any())).willThrow(RuntimeException("Could not save"))

        // When
        val throwable =
            catchBackendUsageException {
                UpdateMissionActionSpeciesOnboard(missionActionsRepository).execute(
                    id = 123,
                    speciesIndex = 0,
                    toleranceMargin = 12.5,
                )
            }

        // Then
        assertThat(throwable.code).isEqualTo(BackendUsageErrorCode.COULD_NOT_UPDATE)
    }

    private fun catchBackendUsageException(block: () -> Unit): BackendUsageException {
        val throwable = catchThrowable { block() }
        assertThat(throwable).isInstanceOf(BackendUsageException::class.java)

        return throwable as BackendUsageException
    }
}
