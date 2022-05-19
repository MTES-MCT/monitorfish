package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class SearchVesselsUTests {

    @MockBean
    private lateinit var vesselRepository: VesselRepository

    @Test
    fun `execute Should return no vessel When the is no identification number`() {
        // Given
        given(vesselRepository.search(any())).willReturn(listOf(Vessel()))

        // When
        val vessels = SearchVessels(vesselRepository).execute("DUMMY VESSEL")

        // Then
        assertThat(vessels).isEmpty()
    }

}
