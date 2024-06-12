package fr.gouv.cnsp.monitorfish.utils

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import java.time.ZoneOffset
import java.time.ZonedDateTime

class ZonedDateTimeDeserializer : JsonDeserializer<ZonedDateTime>() {
    override fun deserialize(jsonParser: JsonParser, ctxt: DeserializationContext): ZonedDateTime {
        return ZonedDateTime.parse(jsonParser.text).withZoneSameInstant(ZoneOffset.UTC)
    }
}
