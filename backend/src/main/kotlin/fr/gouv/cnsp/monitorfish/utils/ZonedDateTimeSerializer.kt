package fr.gouv.cnsp.monitorfish.utils

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.databind.JsonSerializer
import com.fasterxml.jackson.databind.SerializerProvider
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

class ZonedDateTimeSerializer : JsonSerializer<ZonedDateTime>() {
    override fun serialize(
        zonedDateTime: ZonedDateTime,
        jsonGenerator: JsonGenerator,
        serializerProvider: SerializerProvider,
    ) {
        val dateAsString = zonedDateTime.withZoneSameInstant(ZoneOffset.UTC).format(DateTimeFormatter.ISO_INSTANT)

        jsonGenerator.writeString(dateAsString)
    }
}
