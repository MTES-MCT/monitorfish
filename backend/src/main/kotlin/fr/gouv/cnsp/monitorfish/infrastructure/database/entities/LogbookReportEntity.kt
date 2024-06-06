package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.*
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.UNKNOWN_VESSEL
import fr.gouv.cnsp.monitorfish.domain.mappers.ERSMapper.getERSMessageValueFromJSON
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
import jakarta.persistence.*
import org.hibernate.annotations.JdbcType
import org.hibernate.annotations.Type
import org.hibernate.dialect.PostgreSQLEnumJdbcType
import java.time.Instant
import java.time.ZoneOffset.UTC

@Entity
@Table(name = "logbook_reports")
data class LogbookReportEntity(
    @Id
    @SequenceGenerator(name = "logbook_report_id_seq", sequenceName = "logbook_report_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "logbook_report_id_seq")
    @Column(name = "id")
    val id: Long? = null,
    @Column(name = "operation_number")
    val operationNumber: String?,
    @Column(name = "trip_number")
    val tripNumber: String?,
    @Column(name = "operation_country")
    val operationCountry: String?,
    @Column(name = "operation_datetime_utc")
    val operationDateTime: Instant,
    @Column(name = "operation_type")
    @Enumerated(EnumType.STRING)
    val operationType: LogbookOperationType,
    @Column(name = "report_id")
    val reportId: String?,
    @Column(name = "referenced_report_id")
    val referencedReportId: String?,
    @Column(name = "report_datetime_utc")
    val reportDateTime: Instant?,
    @Column(name = "cfr")
    val internalReferenceNumber: String?,
    @Column(name = "ircs")
    val ircs: String?,
    @Column(name = "external_identification")
    val externalReferenceNumber: String?,
    @Column(name = "vessel_name")
    val vesselName: String?,
    // ISO Alpha-3 country code
    @Column(name = "flag_state")
    val flagState: String?,
    @Column(name = "imo")
    val imo: String?,
    @Column(name = "log_type")
    val messageType: String?,
    @Column(name = "analyzed_by_rules", columnDefinition = "varchar(100)[]")
    val analyzedByRules: List<String>?,
    @Type(JsonBinaryType::class)
    @Column(name = "value", nullable = true, columnDefinition = "jsonb")
    val message: String?,
    @Column(name = "integration_datetime_utc")
    val integrationDateTime: Instant,
    @JdbcType(PostgreSQLEnumJdbcType::class)
    @Column(name = "transmission_format", columnDefinition = "logbook_message_transmission_format")
    @Enumerated(EnumType.STRING)
    val transmissionFormat: LogbookTransmissionFormat?,
    @Column(name = "software")
    val software: String?,
    @Column(name = "enriched")
    val isEnriched: Boolean = false,
    @Type(JsonBinaryType::class)
    @Column(name = "trip_gears", nullable = true, columnDefinition = "jsonb")
    val tripGears: String?,
    @Type(JsonBinaryType::class)
    @Column(name = "trip_segments", nullable = true, columnDefinition = "jsonb")
    val tripSegments: String?,
) {
    companion object {
        fun fromLogbookMessage(
            mapper: ObjectMapper,
            logbookMessage: LogbookMessage,
        ) = LogbookReportEntity(
            internalReferenceNumber = logbookMessage.internalReferenceNumber,
            referencedReportId = logbookMessage.referencedReportId,
            externalReferenceNumber = logbookMessage.externalReferenceNumber,
            ircs = logbookMessage.ircs,
            operationDateTime = logbookMessage.operationDateTime.toInstant(),
            reportDateTime = logbookMessage.reportDateTime?.toInstant(),
            integrationDateTime = logbookMessage.integrationDateTime.toInstant(),
            vesselName = logbookMessage.vesselName,
            reportId = logbookMessage.reportId,
            operationNumber = logbookMessage.operationNumber,
            tripNumber = logbookMessage.tripNumber,
            flagState = logbookMessage.flagState,
            imo = logbookMessage.imo,
            analyzedByRules = logbookMessage.analyzedByRules,
            software = logbookMessage.software,
            transmissionFormat = logbookMessage.transmissionFormat,

            isEnriched = logbookMessage.isEnriched,
            message = mapper.writeValueAsString(logbookMessage.message),
            messageType = logbookMessage.messageType,
            operationCountry = null,
            operationType = logbookMessage.operationType,
            tripGears = null,
            tripSegments = null,
        )
    }

    fun toLogbookMessage(mapper: ObjectMapper): LogbookMessage {
        val message = getERSMessageValueFromJSON(mapper, message, messageType, operationType)
        val tripGears = deserializeJSONList(mapper, tripGears, LogbookTripGear::class.java)
        val tripSegments = deserializeJSONList(mapper, tripSegments, LogbookTripSegment::class.java)

        return LogbookMessage(
            id = id!!,
            internalReferenceNumber = internalReferenceNumber,
            referencedReportId = referencedReportId,
            externalReferenceNumber = externalReferenceNumber,
            ircs = ircs,
            operationDateTime = operationDateTime.atZone(UTC),
            reportDateTime = reportDateTime?.atZone(UTC),
            integrationDateTime = integrationDateTime.atZone(UTC),
            vesselName = vesselName,
            reportId = reportId,
            operationNumber = operationNumber,
            tripNumber = tripNumber,
            flagState = flagState,
            imo = imo,
            analyzedByRules = analyzedByRules ?: emptyList(),
            software = software,
            transmissionFormat = transmissionFormat,

            isEnriched = isEnriched,
            message = message,
            messageType = messageType,
            operationType = operationType,
            tripGears = tripGears,
            tripSegments = tripSegments,
        )
    }

    fun toPriorNotification(mapper: ObjectMapper, relatedModels: List<LogbookReportEntity>): PriorNotification {
        val referenceLogbookMessage = toLogbookMessage(mapper)
        val relatedLogbookMessages = relatedModels
            .map { it.toLogbookMessage(mapper) }
            .sortedBy { it.operationDateTime }
        val enrichedLogbookMessageTyped = referenceLogbookMessage
            .toEnrichedLogbookMessageTyped(relatedLogbookMessages, PNO::class.java)
        val updatedAt = relatedLogbookMessages.lastOrNull()?.let { it.operationDateTime.toString() }
            ?: operationDateTime.toString()
        // For pratical reasons `vessel` can't be `null`, so we temporarely set it to "Navire inconnu"
        val vessel = UNKNOWN_VESSEL

        return PriorNotification(
            reportId = reportId,
            authorTrigram = null,
            createdAt = operationDateTime.toString(),
            didNotFishAfterZeroNotice = false,
            isManuallyCreated = false,
            logbookMessageTyped = enrichedLogbookMessageTyped,
            note = null,
            sentAt = enrichedLogbookMessageTyped.logbookMessage.reportDateTime?.toString(),
            updatedAt = updatedAt,
            vessel = vessel,

            // These props need to be calculated in the use case
            port = null,
            reportingCount = null,
            seafront = null,
            vesselRiskFactor = null,
        )
    }

    private fun <T> deserializeJSONList(
        mapper: ObjectMapper,
        json: String?,
        clazz: Class<T>,
    ): List<T> =
        json?.let {
            mapper.readValue(
                json,
                mapper.typeFactory
                    .constructCollectionType(MutableList::class.java, clazz),
            )
        } ?: listOf()
}
