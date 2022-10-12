package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.domain.repositories.ControlObjectivesRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_objective.UpdateControlObjective
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class UpdateControlObjectiveUTests {

    @MockBean
    private lateinit var controlObjectivesRepository: ControlObjectivesRepository

    @Test
    fun `execute Should throw an exception When no field to update is given`() {
        // When
        val throwable = catchThrowable {
            UpdateControlObjective(controlObjectivesRepository).execute(1, null, null, null)
        }

        // Then
        assertThat(throwable).isInstanceOf(IllegalArgumentException::class.java)
        assertThat(throwable.message).contains("No value to update")
    }

    @Test
    fun `execute Should not throw an exception When a field to update is given`() {
        // When
        val throwable = catchThrowable {
            UpdateControlObjective(controlObjectivesRepository).execute(1, 123, null, null)
        }

        // Then
        assertThat(throwable).isNull()
    }
}
