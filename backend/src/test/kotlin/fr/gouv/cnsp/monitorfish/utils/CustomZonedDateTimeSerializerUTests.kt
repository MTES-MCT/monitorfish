package fr.gouv.cnsp.monitorfish.utils

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.module.SimpleModule
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.ZonedDateTime

class CustomZonedDateTimeSerializerUTests {
    @Test
    fun `serialize Should return the expected UTC ISO 8601 date`() {
        // Given
        val mapper = ObjectMapper()
        val module = SimpleModule()
        module.addSerializer(CustomZonedDateTime::class.java, CustomZonedDateTimeSerializer())
        mapper.registerModule(module)

        val dateTime = CustomZonedDateTime(ZonedDateTime.parse("2024-12-21T12:34:56Z"))

        // When
        val result = mapper.writeValueAsString(dateTime)

        // Then
        assertThat(result).isEqualTo("\"2024-12-21T12:34:56Z\"")
    }

    @Test
    fun `serialize Should return the expected UTC ISO 8601 date when parsed from a date without seconds`() {
        // Given
        val mapper = ObjectMapper()
        val module = SimpleModule()
        module.addSerializer(CustomZonedDateTime::class.java, CustomZonedDateTimeSerializer())
        mapper.registerModule(module)

        val dateTime = CustomZonedDateTime(ZonedDateTime.parse("2024-12-21T12:34Z"))

        // When
        val result = mapper.writeValueAsString(dateTime)

        // Then
        assertThat(result).isEqualTo("\"2024-12-21T12:34:00Z\"")
    }

    @Test
    fun `serialize Should return the expected UTC ISO 8601 date when parsed from a local date`() {
        // Given
        val mapper = ObjectMapper()
        val module = SimpleModule()
        module.addSerializer(CustomZonedDateTime::class.java, CustomZonedDateTimeSerializer())
        mapper.registerModule(module)

        val dateTime = CustomZonedDateTime(ZonedDateTime.parse("2024-12-21T12:34:56+02:00"))

        // When
        val result = mapper.writeValueAsString(dateTime)

        // Then
        assertThat(result).isEqualTo("\"2024-12-21T10:34:56Z\"")
    }

    @Test
    fun `serialize Should NOT omit seconds when the source date starts at second '00'`() {
        // Given
        val mapper = ObjectMapper()
        val module = SimpleModule()
        module.addSerializer(CustomZonedDateTime::class.java, CustomZonedDateTimeSerializer())
        mapper.registerModule(module)

        val dateTime = CustomZonedDateTime(ZonedDateTime.parse("2024-12-21T12:34:00Z"))

        // When
        val result = mapper.writeValueAsString(dateTime)

        // Then
        assertThat(result).isEqualTo("\"2024-12-21T12:34:00Z\"")
    }
}
