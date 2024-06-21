package fr.gouv.cnsp.monitorfish.infrastructure.database.entities.converters

import fr.gouv.cnsp.monitorfish.utils.CustomZonedDateTime
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import java.sql.Timestamp
import java.time.LocalDateTime
import java.time.ZoneOffset

class CustomZonedDateTimeConverterUTests {
    private val converter = CustomZonedDateTimeConverter()

    @Test
    fun `convertToDatabaseColumn should convert CustomZonedDateTime to Timestamp`() {
        val customZonedDateTime = CustomZonedDateTime.fromZonedDateTime(LocalDateTime.now().atZone(ZoneOffset.UTC))
        val timestamp = converter.convertToDatabaseColumn(customZonedDateTime)

        assertNotNull(timestamp)
        assertEquals(customZonedDateTime.toZonedDateTime().toLocalDateTime(), timestamp!!.toLocalDateTime())
    }

    @Test
    fun `convertToEntityAttribute should convert Timestamp to CustomZonedDateTime`() {
        val timestamp = Timestamp.valueOf(LocalDateTime.now())
        val customZonedDateTime = converter.convertToEntityAttribute(timestamp)

        assertNotNull(customZonedDateTime)
        assertEquals(timestamp.toLocalDateTime().atZone(ZoneOffset.UTC), customZonedDateTime!!.toZonedDateTime())
    }
}
