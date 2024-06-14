package fr.gouv.cnsp.monitorfish.utils

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.module.SimpleModule
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CustomZonedDateTimeDeserializerUTests {
    @Test
    fun `deserialize Should parse the expected UTC ISO 8601 date`() {
        // Given
        val mapper = ObjectMapper()
        val module = SimpleModule()
        module.addDeserializer(CustomZonedDateTime::class.java, CustomZonedDateTimeDeserializer())
        mapper.registerModule(module)

        val json = "\"2024-12-21T12:34:56Z\""

        // When
        val result = mapper.readValue(json, CustomZonedDateTime::class.java).toString()

        // Then
        assertThat(result).isEqualTo("2024-12-21T12:34:56Z")
    }

    @Test
    fun `deserialize Should parse the expected UTC ISO 8601 date when the input has no seconds`() {
        // Given
        val mapper = ObjectMapper()
        val module = SimpleModule()
        module.addDeserializer(CustomZonedDateTime::class.java, CustomZonedDateTimeDeserializer())
        mapper.registerModule(module)

        val json = "\"2024-12-21T12:34Z\""

        // When
        val result = mapper.readValue(json, CustomZonedDateTime::class.java).toString()

        // Then
        assertThat(result).isEqualTo("2024-12-21T12:34:00Z")
    }

    @Test
    fun `deserialize Should parse the expected UTC ISO 8601 date when the input is in a different time zone`() {
        // Given
        val mapper = ObjectMapper()
        val module = SimpleModule()
        module.addDeserializer(CustomZonedDateTime::class.java, CustomZonedDateTimeDeserializer())
        mapper.registerModule(module)

        val json = "\"2024-12-21T12:34:56+02:00\""

        // When
        val result = mapper.readValue(json, CustomZonedDateTime::class.java).toString()

        // Then
        assertThat(result).isEqualTo("2024-12-21T10:34:56Z")
    }

    @Test
    fun `deserialize Should NOT omit seconds when the source date starts at second '00'`() {
        // Given
        val mapper = ObjectMapper()
        val module = SimpleModule()
        module.addDeserializer(CustomZonedDateTime::class.java, CustomZonedDateTimeDeserializer())
        mapper.registerModule(module)

        val json = "\"2024-12-21T12:34:00Z\""

        // When
        val result = mapper.readValue(json, CustomZonedDateTime::class.java).toString()

        // Then
        assertThat(result).isEqualTo("2024-12-21T12:34:00Z")
    }
}
