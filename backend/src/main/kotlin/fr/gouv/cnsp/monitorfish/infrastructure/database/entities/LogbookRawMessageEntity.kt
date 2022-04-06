package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import java.time.Instant
import javax.persistence.*

@Entity
@Table(name = "logbook_raw_messages")
data class LogbookRawMessageEntity(
        @Id
        @Column(name = "operation_number")
        val operationNumber: String,
        @Column(name = "xml_message")
        val rawMessage: String? = null)

