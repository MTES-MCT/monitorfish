package fr.gouv.cnsp.monitorfish.domain.mappers

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.LogbookMessageValue
import fr.gouv.cnsp.monitorfish.domain.exceptions.EntityConversionException
import org.springframework.stereotype.Component

@Component
object ERSMapper {
    private const val JSONB_NULL_STRING = "null"

    fun getERSMessageValueFromJSON(
        mapper: ObjectMapper,
        message: String?,
        messageType: String?,
        operationType: LogbookOperationType,
    ): LogbookMessageValue? {
        return try {
            if (operationType == LogbookOperationType.RET && !message.isNullOrEmpty() && message != JSONB_NULL_STRING) {
                val classType = LogbookOperationTypeMapping.getClassFromName(operationType.name)

                mapper.readValue(message, classType)
            } else if (!messageType.isNullOrEmpty() && !message.isNullOrEmpty() && message != JSONB_NULL_STRING) {
                val classType = LogbookMessageTypeMapping.getClassFromName(messageType)

                mapper.readValue(message, classType)
            } else {
                null
            }
        } catch (e: Exception) {
            throw EntityConversionException("Error while converting 'LogbookMessage'. $message", e)
        }
    }
}
