package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table

@Entity
@Table(name = "logbook_raw_messages")
data class LogbookRawMessageEntity(
    @Id
    @Column(name = "operation_number")
    val operationNumber: String,
    @Column(name = "xml_message")
    val rawMessage: String? = null
)
