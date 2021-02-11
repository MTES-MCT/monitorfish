package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSOperationType
import java.time.Instant
import javax.persistence.*

@Entity
@Table(name = "ers_messages")
data class ERSMessageEntity(
        @Id
        @Column(name = "operation_number")
        val operationNumber: String,
        @Column(name = "trip_number")
        val tripNumber: Int? = null,
        @Column(name = "operation_country")
        val operationCountry: String? = null,
        @Column(name = "operation_datetime_utc")
        val operationDateTime: Instant,
        @Column(name = "operation_type")
        @Enumerated(EnumType.STRING)
        val operationType: ERSOperationType,
        @Column(name = "ers_id")
        val ersId: String,
        @Column(name = "referenced_ers_id")
        val ersIdToDeleteOrCorrect: String? = null,
        @Column(name = "ers_datetime_utc")
        val ersDateTime: Instant? = null,
        @Column(name = "cfr")
        val internalReferenceNumber: String? = null,
        @Column(name = "ircs")
        val ircs: String? = null,
        @Column(name = "external_identification")
        val externalReferenceNumber: String? = null,
        @Column(name = "vessel_name")
        val vesselName: String? = null,
        @Column(name = "flag_state")
        val flagState: String? = null,
        @Column(name = "imo")
        val imo: String? = null,
        @Column(name = "xml_message")
        val rawMessage: String? = null,
        @Column(name = "integration_datetime_utc")
        val parsedIntegrationDateTime: Instant? = null)

