package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import com.vladmihalcea.hibernate.type.json.JsonBinaryType
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSMessage
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSOperationType
import fr.gouv.cnsp.monitorfish.domain.mappers.ERSMapper.getERSMessageValueFromJSON
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
import java.time.Instant
import java.time.ZoneOffset.UTC
import javax.persistence.*

@Entity
@TypeDef(name = "jsonb", typeClass = JsonBinaryType::class)
@Table(name = "ers")
data class ERSEntity(
        @Id
        @SequenceGenerator(name = "ers_id_seq", sequenceName = "ers_id_seq", allocationSize = 1)
        @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ers_id_seq")
        @Column(name = "id")
        val id: Int? = null,

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
        val referencedErsId: String? = null,
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
        @Column(name = "log_type")
        val messageType: String,
        @Type(type = "jsonb")
        @Column(name = "value", nullable = true, columnDefinition = "jsonb")
        val message: String? = null,
        @Column(name = "integration_datetime_utc")
        val integrationDateTime: Instant? = null) {

        fun toERSMessage(mapper: ObjectMapper) = ERSMessage(
                internalReferenceNumber = internalReferenceNumber,
                referencedErsId = referencedErsId,
                externalReferenceNumber = externalReferenceNumber,
                ircs = ircs,
                operationDateTime = operationDateTime.atZone(UTC),
                vesselName = vesselName,
                operationType = operationType,
                ersId = ersId,
                operationNumber = operationNumber,
                tripNumber = tripNumber,
                flagState = flagState,
                imo = imo,
                messageType = messageType,
                message = getERSMessageValueFromJSON(mapper, message, messageType, operationType))
}
