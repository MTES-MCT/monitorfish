package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import com.nhaarman.mockitokotlin2.given
import com.nhaarman.mockitokotlin2.mock
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselContactToUpdateRepository
import fr.gouv.cnsp.monitorfish.fakers.VesselContactToUpdateFaker
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.Mock

class GetVesselContactToUpdateByVesselIdUTests {
    @Mock
    private val vesselContactToRepository: VesselContactToUpdateRepository = mock()

    private val getVesselContactToUpdateByVesselId = GetVesselContactToUpdateByVesselId(vesselContactToRepository)

    @Test
    fun `execute should return the given vessel contact method to update when it exists`() {
        // Given
        val vesselId = 1
        val vesselContactToUpdate = VesselContactToUpdateFaker.fakeVesselContactToUpdate()
        given(vesselContactToRepository.findByVesselId(vesselId)).willReturn(vesselContactToUpdate)

        // When
        val vesselContactToUpdateFound = getVesselContactToUpdateByVesselId.execute(vesselId)

        // Then
        assertThat(vesselContactToUpdate).isEqualTo(vesselContactToUpdateFound)
    }

    @Test
    fun `execute should return null when vessel contact method to update is not found`() {
        // Given
        val vesselId = 1
        given(vesselContactToRepository.findByVesselId(vesselId)).willReturn(null)

        // When
        val vesselContactToUpdate = getVesselContactToUpdateByVesselId.execute(vesselId)

        // Then
        assertThat(vesselContactToUpdate).isNull()
    }
}
