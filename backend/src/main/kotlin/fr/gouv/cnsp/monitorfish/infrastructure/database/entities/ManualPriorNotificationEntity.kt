package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.*
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.UNKNOWN_VESSEL
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendInternalException
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.converters.deserializeJSONList
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
import jakarta.persistence.*
import org.hibernate.annotations.Type
import java.time.ZonedDateTime

@Entity
@Table(name = "manual_prior_notifications")
data class ManualPriorNotificationEntity(
    @Id
    @Column(name = "report_id", updatable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val reportId: String?,
    @Column(name = "vessel_id", nullable = false)
    val vesselId: Int,
    @Column(name = "cfr")
    val cfr: String?,
    @Column(name = "external_immatriculation")
    val externalReferenceNumber: String? = null,
    @Column(name = "ircs")
    val ircs: String? = null,
    @Column(name = "created_at")
    val createdAt: ZonedDateTime,
    @Column(name = "did_not_fish_after_zero_notice")
    val didNotFishAfterZeroNotice: Boolean,
    // ISO Alpha-3 country code
    @Column(name = "flag_state")
    val flagState: String?,
    @Column(name = "sent_at")
    val sentAt: ZonedDateTime,
    @Column(name = "trip_gears", nullable = true, columnDefinition = "jsonb")
    @Type(JsonBinaryType::class)
    val tripGears: String?,
    @Column(name = "trip_segments", nullable = true, columnDefinition = "jsonb")
    @Type(JsonBinaryType::class)
    val tripSegments: String?,
    @Column(name = "value", nullable = true, columnDefinition = "jsonb")
    @Type(JsonBinaryType::class)
    val value: String,
    @Column(name = "vessel_name")
    val vesselName: String?,
) {
    companion object {
        fun fromPriorNotification(
            mapper: ObjectMapper,
            priorNotification: PriorNotification,
        ): ManualPriorNotificationEntity {
            try {
                val pnoLogbookMessage = priorNotification.logbookMessageAndValue.logbookMessage
                val pnoLogbookMessageValue = priorNotification.logbookMessageAndValue.value
                val createdAt = priorNotification.createdAt ?: ZonedDateTime.now()

                val sentAt = requireNotNull(priorNotification.sentAt) { "`sentAt` is null." }
                val vesselId = requireNotNull(pnoLogbookMessage.vesselId) { "`vesselId` is null." }

                return ManualPriorNotificationEntity(
                    reportId = pnoLogbookMessage.reportId,
                    cfr = pnoLogbookMessage.internalReferenceNumber,
                    ircs = pnoLogbookMessage.ircs,
                    externalReferenceNumber = pnoLogbookMessage.externalReferenceNumber,
                    createdAt = createdAt,
                    didNotFishAfterZeroNotice = priorNotification.didNotFishAfterZeroNotice,
                    flagState = pnoLogbookMessage.flagState,
                    sentAt = sentAt,
                    tripGears = mapper.writeValueAsString(pnoLogbookMessage.tripGears),
                    tripSegments = mapper.writeValueAsString(pnoLogbookMessage.tripSegments),
                    value = mapper.writeValueAsString(pnoLogbookMessageValue),
                    vesselName = pnoLogbookMessage.vesselName,
                    vesselId = vesselId,
                )
            } catch (e: IllegalArgumentException) {
                throw BackendInternalException(
                    "Error while converting `PriorNotification` to `ManualPriorNotificationEntity` (likely because a non-nullable variable is null).",
                    e,
                )
            }
        }
    }

    fun toPriorNotification(mapper: ObjectMapper): PriorNotification {
        try {
            val reportId = requireNotNull(reportId) { "`reportId` is null." }
            val parsedValue = mapper.readValue(value, PNO::class.java)
            val predictedArrivalDatetimeUtc =
                requireNotNull(parsedValue.predictedArrivalDatetimeUtc) { "`predictedArrivalDatetimeUtc` is null." }

            val pnoLogbookMessage =
                LogbookMessage(
                    id = null,
                    reportId = reportId,
                    flagState = flagState,
                    isEnriched = true,
                    integrationDateTime = createdAt,
                    internalReferenceNumber = cfr,
                    ircs = ircs,
                    externalReferenceNumber = externalReferenceNumber,
                    message = parsedValue,
                    messageType = LogbookMessageTypeMapping.PNO.name,
                    operationDateTime = createdAt,
                    activityDateTime = predictedArrivalDatetimeUtc,
                    operationNumber = null,
                    operationType = LogbookOperationType.DAT,
                    reportDateTime = sentAt,
                    transmissionFormat = LogbookTransmissionFormat.MANUAL,
                    tripGears = deserializeJSONList(mapper, tripGears, LogbookTripGear::class.java),
                    tripSegments = deserializeJSONList(mapper, tripSegments, LogbookTripSegment::class.java),
                    vesselName = vesselName,
                    vesselId = vesselId,
                )
            // For practical reasons `vessel` can't be `null`, so we temporarily set it to "Navire inconnu"
            val vessel =
                UNKNOWN_VESSEL.copy(
                    // used to retrieve vessel from manual pno
                    internalReferenceNumber = pnoLogbookMessage.internalReferenceNumber,
                )
            val logbookMessageAndValue = LogbookMessageAndValue(pnoLogbookMessage, PNO::class.java)

            return PriorNotification(
                createdAt = createdAt,
                didNotFishAfterZeroNotice = didNotFishAfterZeroNotice,
                isManuallyCreated = true,
                logbookMessageAndValue = logbookMessageAndValue,
                reportId = reportId,
                sentAt = sentAt,
                updatedAt = logbookMessageAndValue.value.updatedAt,
                port =
                    logbookMessageAndValue.value.port?.let {
                        Port(
                            locode = it,
                            null,
                            name = logbookMessageAndValue.value.portName ?: "",
                            facade = null,
                            faoAreas = emptyList(),
                            latitude = null,
                            longitude = null,
                            region = null,
                        )
                    },
                reportingCount = null,
                seafront = null,
                vessel = vessel,
                lastControlDateTime = null,
            )
        } catch (e: IllegalArgumentException) {
            throw BackendInternalException(
                "Error while converting `ManualPriorNotificationEntity` to `PriorNotification` (likely because a non-nullable variable is null).",
                e,
            )
        }
    }
}
