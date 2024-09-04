package fr.gouv.cnsp.monitorfish.utils

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.databind.JsonSerializer
import com.fasterxml.jackson.databind.SerializerProvider
import java.time.ZoneOffset

class CustomZonedDateTimeSerializer : JsonSerializer<CustomZonedDateTime>() {
    override fun serialize(
        zonedDateTime: CustomZonedDateTime,
        jsonGenerator: JsonGenerator,
        serializerProvider: SerializerProvider,
    ) {
        val dateAsString =
            zonedDateTime
                .toZonedDateTime()
                .withZoneSameInstant(ZoneOffset.UTC)
                .format(CustomZonedDateTime.dateTimeFormatter)

        jsonGenerator.writeString(dateAsString)
    }
}
