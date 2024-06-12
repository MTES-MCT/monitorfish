package fr.gouv.cnsp.monitorfish.utils

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.databind.JsonSerializer
import com.fasterxml.jackson.databind.SerializerProvider
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

class ZonedDateTimeSerializer : JsonSerializer<ZonedDateTime>() {
    override fun serialize(
        value: ZonedDateTime,
        jsonGenerator: JsonGenerator,
        serializerProvider: SerializerProvider,
    ) {
        jsonGenerator.writeString(
            value.withZoneSameInstant(ZoneOffset.UTC).format(DateTimeFormatter.ISO_INSTANT),
        )
    }
}
