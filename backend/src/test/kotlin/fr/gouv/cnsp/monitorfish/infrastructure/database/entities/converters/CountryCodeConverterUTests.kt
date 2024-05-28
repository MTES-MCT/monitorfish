package fr.gouv.cnsp.monitorfish.infrastructure.database.entities.converters

import com.neovisionaries.i18n.CountryCode
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CountryCodeConverterUTests {
    private val converter = CountryCodeConverter()

    @Test
    fun `convertToDatabaseColumn should return enum name`() {
        // When
        val result = converter.convertToDatabaseColumn(CountryCode.US)

        // Then
        assertThat(result).isEqualTo("US")
    }

    @Test
    fun `convertToDatabaseColumn should return null for null attribute`() {
        // When
        val result = converter.convertToDatabaseColumn(null)

        // Then
        assertThat(result).isEqualTo(null)
    }

    @Test
    fun `convertToEntityAttribute should return enum for valid dbData`() {
        // When
        val result = converter.convertToEntityAttribute("US")

        // Then
        assertThat(result).isEqualTo(CountryCode.US)
    }

    @Test
    fun `convertToEntityAttribute should return UNDEFINED for invalid dbData`() {
        // When
        val result = converter.convertToEntityAttribute("INVALID_CODE")

        // Then
        assertThat(result).isEqualTo(CountryCode.UNDEFINED)
    }

    @Test
    fun `convertToEntityAttribute should return UNDEFINED for null dbData`() {
        // When
        val result = converter.convertToEntityAttribute(null)

        // Then
        assertThat(result).isEqualTo(CountryCode.UNDEFINED)
    }
}
