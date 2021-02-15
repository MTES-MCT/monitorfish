package fr.gouv.cnsp.monitorfish.domain.mappers

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSMessageTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSOperationTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.ERSMessageValue
import fr.gouv.cnsp.monitorfish.domain.exceptions.EntityConversionException
import org.springframework.stereotype.Component
import java.util.*

@Component
object ERSMapper {
    fun getERSMessageValueFromJSON(mapper: ObjectMapper, message: String?, messageType: String?, operationType: ERSOperationType): ERSMessageValue? {
        return try {
            if(operationType == ERSOperationType.RET && !message.isNullOrEmpty()) {
                val classType = ERSOperationTypeMapping.getClassFromName(operationType.name)

                mapper.readValue(message, classType)
            } else if (!messageType.isNullOrEmpty() && !message.isNullOrEmpty()) {
                val classType = ERSMessageTypeMapping.getClassFromName(messageType)

                mapper.readValue(message, classType)
            } else {
                null
            }

        } catch (e: Exception) {
            throw EntityConversionException("Error while converting 'ERSMessage'. $message", e)
        }
    }
}