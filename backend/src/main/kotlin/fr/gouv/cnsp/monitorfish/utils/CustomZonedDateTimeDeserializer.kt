package fr.gouv.cnsp.monitorfish.utils

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

class CustomZonedDateTimeDeserializer : JsonDeserializer<CustomZonedDateTime>() {
    override fun deserialize(
        jsonParser: JsonParser,
        deserializationContext: DeserializationContext,
    ): CustomZonedDateTime {
        val zonedDateTime =
            ZonedDateTime
                .parse(jsonParser.text, DateTimeFormatter.ISO_DATE_TIME)
                .withZoneSameInstant(ZoneOffset.UTC)

        return CustomZonedDateTime(zonedDateTime)
    }
}
