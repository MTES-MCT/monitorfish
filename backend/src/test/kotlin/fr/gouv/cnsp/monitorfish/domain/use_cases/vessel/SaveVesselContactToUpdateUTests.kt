package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import com.nhaarman.mockitokotlin2.given
import com.nhaarman.mockitokotlin2.mock
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselContactToUpdateRepository
import fr.gouv.cnsp.monitorfish.fakers.VesselContactToUpdateFaker
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.Mock

class SaveVesselContactToUpdateUTests {
    @Mock
    private val vesselContactToRepository: VesselContactToUpdateRepository = mock()

    private val saveVesselContactToUpdate = SaveVesselContactToUpdate(vesselContactToRepository)

    @Test
    fun `execute should return the saved entity`() {
        // Given
        val vesselContactToUpdate = VesselContactToUpdateFaker.fakeVesselContactToUpdate()
        val vesselContactToUpdateSaved = VesselContactToUpdateFaker.fakeVesselContactToUpdate()
        given(vesselContactToRepository.save(vesselContactToUpdate)).willReturn(vesselContactToUpdate)

        // When
        val savedVesselContactToUpdate = saveVesselContactToUpdate.execute(vesselContactToUpdate)

        // Then
        assertThat(savedVesselContactToUpdate).isEqualTo(vesselContactToUpdateSaved)
    }
}
