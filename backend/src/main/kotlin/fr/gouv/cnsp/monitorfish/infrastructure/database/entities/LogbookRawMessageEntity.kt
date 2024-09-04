package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookRawMessage
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "logbook_raw_messages")
data class LogbookRawMessageEntity(
    @Id
    @Column(name = "operation_number")
    val operationNumber: String,
    @Column(name = "xml_message")
    val rawMessage: String? = null,
) {
    companion object {
        fun fromLogbookRawMessage(logbookRawMessage: LogbookRawMessage) =
            LogbookRawMessageEntity(
                operationNumber = logbookRawMessage.operationNumber,
                rawMessage = logbookRawMessage.rawMessage,
            )
    }
}
