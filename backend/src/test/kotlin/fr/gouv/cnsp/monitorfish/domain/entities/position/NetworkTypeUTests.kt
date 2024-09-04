package fr.gouv.cnsp.monitorfish.domain.entities.position

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class CountryCodeUTests {
    @Test
    fun `from Should return null if not found`() {
        // When
        val result = NetworkType.from("INCORRECT")

        // Then
        assertThat(result).isNull()
    }
}
