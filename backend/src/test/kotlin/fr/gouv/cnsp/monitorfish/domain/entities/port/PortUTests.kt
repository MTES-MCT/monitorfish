package fr.gouv.cnsp.monitorfish.domain.entities.port

import fr.gouv.cnsp.monitorfish.fakers.PortFaker
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class PortUTests {
    @Test
    fun `isFrenchOrUnknown Should return true when port is unknown`() {
        // Given
        val port = PortFaker.fakePort(locode = "FRABC", countryCode = null, name = "Fake Port")

        // When
        val result = port.isFrenchOrUnknown()

        // Then
        assertThat(result).isTrue()
    }

    @Test
    fun `isFrenchOrUnknown Should return false when country code is not French`() {
        // Given
        val port = PortFaker.fakePort(locode = "FRABC", countryCode = "US", name = "Fake Port")

        // When
        val result = port.isFrenchOrUnknown()

        // Then
        assertThat(result).isFalse()
    }

    @Test
    fun `isFrenchOrUnknown Should return true when country code is French`() {
        // Given
        val port = PortFaker.fakePort(locode = "FRABC", countryCode = "TF", name = "Fake Port")

        // When
        val result = port.isFrenchOrUnknown()

        // Then
        assertThat(result).isTrue()
    }
}
