package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import org.assertj.core.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class GetVesselsUTests {
    @MockitoBean
    private lateinit var vesselRepository: VesselRepository

    @Test
    fun `execute should propagate exception when repository throws unexpectedly`() {
        // Given
        val runtimeException = RuntimeException("Unexpected DB error")
        given(vesselRepository.findAll()).willThrow(runtimeException)

        // When & Then
        val exception =
            assertThrows<RuntimeException> {
                GetVessels(vesselRepository).execute()
            }
        assertThat(exception).isSameAs(runtimeException)
    }

    @Test
    fun `execute Should return vessels `() {
        // Given
        given(vesselRepository.findAll()).willReturn(
            listOf(
                Vessel(1, internalReferenceNumber = "1234", flagState = CountryCode.FR, hasLogbookEsacapt = false),
                Vessel(2, internalReferenceNumber = "5789", flagState = CountryCode.FR, hasLogbookEsacapt = false),
            ),
        )

        // When
        val vessels = GetVessels(vesselRepository).execute()

        // Then
        assertThat(vessels).hasSize(2)
        assertThat(vessels.first().id).isEqualTo(1)
        assertThat(vessels.last().id).isEqualTo(2)
    }
}
