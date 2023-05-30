package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import io.hypersistence.utils.hibernate.type.array.ListArrayType
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTransmissionFormat
import fr.gouv.cnsp.monitorfish.domain.mappers.ERSMapper.getERSMessageValueFromJSON
import jakarta.persistence.*
import org.hibernate.annotations.Type
import java.time.Instant
import java.time.ZoneOffset.UTC

@Entity
@Table(name = "logbook_reports")
data class LogbookReportEntity(
    @Id
    @SequenceGenerator(name = "logbook_report_id_seq", sequenceName = "logbook_report_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "logbook_report_id_seq")
    @Column(name = "id")
    val id: Long,

    @Column(name = "operation_number")
    val operationNumber: String,
    @Column(name = "trip_number")
    val tripNumber: String? = null,
    @Column(name = "operation_country")
    val operationCountry: String? = null,
    @Column(name = "operation_datetime_utc")
    val operationDateTime: Instant,
    @Column(name = "operation_type")
    @Enumerated(EnumType.STRING)
    val operationType: LogbookOperationType,
    @Column(name = "report_id")
    val reportId: String? = null,
    @Column(name = "referenced_report_id")
    val referencedReportId: String? = null,
    @Column(name = "report_datetime_utc")
    val reportDateTime: Instant? = null,
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
    val messageType: String? = null,
    @Type(ListArrayType::class)
    @Column(name = "analyzed_by_rules", columnDefinition = "varchar(100)[]")
    val analyzedByRules: List<String>? = listOf(),
    @Type(JsonBinaryType::class)
    @Column(name = "value", nullable = true, columnDefinition = "jsonb")
    val message: String? = null,
    @Column(name = "integration_datetime_utc")
    val integrationDateTime: Instant? = null,
    @Column(name = "transmission_format")
    @Enumerated(EnumType.STRING)
    val transmissionFormat: LogbookTransmissionFormat,
    @Column(name = "software")
    val software: String? = null,
) {

    fun toLogbookMessage(mapper: ObjectMapper) = LogbookMessage(
        id = id,
        internalReferenceNumber = internalReferenceNumber,
        referencedReportId = referencedReportId,
        externalReferenceNumber = externalReferenceNumber,
        ircs = ircs,
        operationDateTime = operationDateTime.atZone(UTC),
        reportDateTime = reportDateTime?.atZone(UTC),
        integrationDateTime = integrationDateTime?.atZone(UTC),
        vesselName = vesselName,
        operationType = operationType,
        reportId = reportId,
        operationNumber = operationNumber,
        tripNumber = tripNumber,
        flagState = flagState,
        imo = imo,
        messageType = messageType,
        analyzedByRules = analyzedByRules ?: listOf(),
        message = getERSMessageValueFromJSON(mapper, message, messageType, operationType),
        software = software,
        transmissionFormat = transmissionFormat,
    )
}
