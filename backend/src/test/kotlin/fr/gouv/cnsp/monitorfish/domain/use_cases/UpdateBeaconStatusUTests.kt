package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.VesselStatus
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusesRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class UpdateBeaconStatusUTests {

    @MockBean
    private lateinit var beaconStatusesRepository: BeaconStatusesRepository

    @Test
    fun `execute Should throw an exception When no field to update is given`() {
        // When
        val throwable = catchThrowable {
            UpdateBeaconStatus(beaconStatusesRepository).execute(1, null, null)
        }

        // Then
        assertThat(throwable).isInstanceOf(IllegalArgumentException::class.java)
        assertThat(throwable.message).contains("No value to update")
    }

    @Test
    fun `execute Should not throw an exception When a field to update is given`() {
        // When
        val throwable = catchThrowable {
            UpdateBeaconStatus(beaconStatusesRepository).execute(1, VesselStatus.AT_SEA, null)
        }

        // Then
        assertThat(throwable).isNull()
    }

}
