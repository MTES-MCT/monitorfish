package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.*
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationType
import fr.gouv.cnsp.monitorfish.domain.mappers.ERSMapper.getERSMessageValueFromJSON
import io.hypersistence.utils.hibernate.type.array.ListArrayType
import io.hypersistence.utils.hibernate.type.basic.PostgreSQLEnumType
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
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
    val id: Long? = null,
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
    val integrationDateTime: Instant,
    @Type(PostgreSQLEnumType::class)
    @Column(name = "transmission_format", columnDefinition = "logbook_message_transmission_format")
    @Enumerated(EnumType.STRING)
    val transmissionFormat: LogbookTransmissionFormat,
    @Column(name = "software")
    val software: String? = null,
    @Column(name = "enriched")
    val isEnriched: Boolean,
    @Type(JsonBinaryType::class)
    @Column(name = "trip_gears", nullable = true, columnDefinition = "jsonb")
    val tripGears: String? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "trip_segments", nullable = true, columnDefinition = "jsonb")
    val tripSegments: String? = null,
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "vessel_id", nullable = true)
    val vessel: VesselEntity? = null,
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    // TODO Should it be CFR?
    @JoinColumn(name = "cfr", referencedColumnName = "cfr", nullable = true, insertable = false, updatable = false)
    val vesselRiskFactor: RiskFactorsEntity? = null,
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
            operationType = logbookMessage.operationType,
            reportId = logbookMessage.reportId,
            operationNumber = logbookMessage.operationNumber,
            tripNumber = logbookMessage.tripNumber,
            flagState = logbookMessage.flagState,
            imo = logbookMessage.imo,
            messageType = logbookMessage.messageType,
            analyzedByRules = logbookMessage.analyzedByRules,
            message = mapper.writeValueAsString(logbookMessage.message),
            software = logbookMessage.software,
            transmissionFormat = logbookMessage.transmissionFormat,
            isEnriched = logbookMessage.isEnriched,
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
            operationType = operationType,
            reportId = reportId,
            operationNumber = operationNumber,
            tripNumber = tripNumber,
            flagState = flagState,
            imo = imo,
            messageType = messageType,
            analyzedByRules = analyzedByRules ?: listOf(),
            message = message,
            software = software,
            transmissionFormat = transmissionFormat,
            isEnriched = isEnriched,
            tripGears = tripGears,
            tripSegments = tripSegments,
        )
    }

    fun toPriorNotification(mapper: ObjectMapper): PriorNotification {
        val messageAsJsonNode = mapper.readTree(message)

        val expectedArrivalDate = messageAsJsonNode.get("predictedArrivalDatetimeUtc")?.asText()
        val expectedLandingDate = messageAsJsonNode.get("predictedLandingDatetimeUtc")?.asText()
        val landingCauseCode = messageAsJsonNode.get("purpose")?.asText()
        val onboardCatches =
            deserializeJSONList(mapper, messageAsJsonNode.get("catchOnboard")?.toString(), Catch::class.java)
        val portLocode = messageAsJsonNode.get("port")?.asText()
        val tripGears = deserializeJSONList(mapper, tripGears, LogbookTripGear::class.java)
        val tripSegments = deserializeJSONList(mapper, tripSegments, LogbookTripSegment::class.java)
        val types =
            deserializeJSONList(
                mapper,
                messageAsJsonNode.get("pnoTypes")?.toString(),
                PriorNotificationType::class.java,
            )

        return PriorNotification(
            id = id!!,
            expectedArrivalDate = expectedArrivalDate,
            expectedLandingDate = expectedLandingDate,
            isVesselUnderCharter = vessel?.underCharter,
            types = types,
            onboardCatches = onboardCatches,
            portLocode = portLocode,
            purposeCode = landingCauseCode,
            sentAt = reportDateTime.toString(),
            tripGears = tripGears,
            tripSegments = tripSegments,
            vesselId = vessel!!.id,
            vesselExternalReferenceNumber = vessel.externalReferenceNumber,
            vesselFlagCountryCode = vessel.flagState,
            vesselInternalReferenceNumber = vessel.internalReferenceNumber,
            vesselIrcs = vessel.ircs,
            vesselMmsi = vessel.mmsi,
            vesselLastControlDate = vesselRiskFactor?.lastControlDatetime?.toString(),
            vesselLength = vessel.length,
            vesselName = vessel.vesselName,
            vesselRiskFactor = vesselRiskFactor?.riskFactor,
            vesselRiskFactorDetectability = vesselRiskFactor?.detectabilityRiskFactor,
            vesselRiskFactorImpact = vesselRiskFactor?.impactRiskFactor,
            vesselRiskFactorProbability = vesselRiskFactor?.probabilityRiskFactor,
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
