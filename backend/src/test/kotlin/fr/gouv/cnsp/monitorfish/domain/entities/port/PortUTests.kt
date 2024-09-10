package fr.gouv.cnsp.monitorfish.domain.entities.port

import fr.gouv.cnsp.monitorfish.fakers.PortFaker
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class PortUTests {
    @Test
    fun `isFrenchOrUnknown Should return true when its country code is unknown`() {
        // Given
        val port = PortFaker.fakePort(countryCode = null)

        // When
        val result = port.isFrenchOrUnknown()

        // Then
        assertThat(result).isTrue()
    }

    @Test
    fun `isFrenchOrUnknown Should return true when its country code is French`() {
        // Given
        val port = PortFaker.fakePort(countryCode = "TF")

        // When
        val result = port.isFrenchOrUnknown()

        // Then
        assertThat(result).isTrue()
    }

    @Test
    fun `isFrenchOrUnknown Should return false when its country code is not French`() {
        // Given
        val port = PortFaker.fakePort(countryCode = "US")

        // When
        val result = port.isFrenchOrUnknown()

        // Then
        assertThat(result).isFalse()
    }
}
