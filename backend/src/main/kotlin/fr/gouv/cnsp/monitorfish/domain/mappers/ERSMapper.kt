package fr.gouv.cnsp.monitorfish.domain.mappers

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSMessageTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.ERSMessageValue
import fr.gouv.cnsp.monitorfish.domain.exceptions.EntityConversionException
import org.springframework.stereotype.Component
import java.util.*

@Component
object ERSMapper {
    fun getERSMessageValueFromJSON(mapper: ObjectMapper, message: String?, messageType: String?): ERSMessageValue? {
        return try {
            if (Objects.isNull(message) || Objects.isNull(messageType) || message?.isEmpty()!!) {
                null
            } else {
                val classType = ERSMessageTypeMapping.getClassFromName(messageType!!)

                mapper.readValue(message, classType)
            }
        } catch (e: Exception) {
            throw EntityConversionException("Error while converting 'ERSMessage'. $message", e)
        }
    }
}