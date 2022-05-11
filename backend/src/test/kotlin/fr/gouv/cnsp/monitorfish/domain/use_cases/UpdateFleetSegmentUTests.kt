package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.UpdateFleetSegmentFields
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mockito
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class UpdateFleetSegmentUTests {

    @MockBean
    private lateinit var fleetSegmentRepository: FleetSegmentRepository

    @Test
    fun `execute Should throw an exception When there is no fields given`() {
        // When
        val throwable = catchThrowable {
            UpdateFleetSegment(fleetSegmentRepository).execute("SEGMENT", UpdateFleetSegmentFields())
        }

        // Then
        assertThat(throwable).isNotNull
        assertThat(throwable.message).isEqualTo("No value to update")
    }

    @Test
    fun `execute Should update repository When a field is given`() {
        // Given
        val fields = UpdateFleetSegmentFields(bycatchSpecies = listOf("AMZ", "HKE"))

        // When
        UpdateFleetSegment(fleetSegmentRepository).execute("SEGMENT", fields)

        // Then
        Mockito.verify(fleetSegmentRepository).update("SEGMENT", fields)
    }
}
