package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.*
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.UNKNOWN_VESSEL
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendInternalException
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
    val tripGears: List<LogbookTripGear>?,
    @Column(name = "trip_segments", nullable = true, columnDefinition = "jsonb")
    @Type(JsonBinaryType::class)
    val tripSegments: List<LogbookTripSegment>?,
    @Column(name = "updated_at")
    val updatedAt: ZonedDateTime,
    @Column(name = "value", nullable = true, columnDefinition = "jsonb")
    @Type(JsonBinaryType::class)
    val value: PNO,
    @Column(name = "vessel_name")
    val vesselName: String?,
) {
    companion object {
        fun fromPriorNotification(
            priorNotification: PriorNotification,
            isUpdate: Boolean = false,
        ): ManualPriorNotificationEntity {
            try {
                val pnoLogbookMessage = priorNotification.logbookMessageAndValue.logbookMessage
                val pnoLogbookMessageValue = priorNotification.logbookMessageAndValue.value
                val createdAt = priorNotification.createdAt ?: ZonedDateTime.now()
                val updatedAt =
                    if (isUpdate || priorNotification.updatedAt == null) {
                        ZonedDateTime.now()
                    } else {
                        priorNotification.updatedAt
                    }

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
                    tripGears = pnoLogbookMessage.tripGears,
                    tripSegments = pnoLogbookMessage.tripSegments,
                    updatedAt = updatedAt,
                    value = pnoLogbookMessageValue,
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

    fun toPriorNotification(): PriorNotification {
        try {
            val reportId = requireNotNull(reportId) { "`reportId` is null." }

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
                    message = value,
                    messageType = LogbookMessageTypeMapping.PNO.name,
                    operationDateTime = createdAt,
                    operationNumber = null,
                    operationType = LogbookOperationType.DAT,
                    reportDateTime = sentAt,
                    transmissionFormat = null,
                    tripGears = tripGears,
                    tripSegments = tripSegments,
                    vesselName = vesselName,
                    vesselId = vesselId,
                )
            // For practical reasons `vessel` can't be `null`, so we temporarily set it to "Navire inconnu"
            val vessel = UNKNOWN_VESSEL
            val logbookMessageAndValue = LogbookMessageAndValue(pnoLogbookMessage, PNO::class.java)

            return PriorNotification(
                createdAt = createdAt,
                didNotFishAfterZeroNotice = didNotFishAfterZeroNotice,
                isManuallyCreated = true,
                logbookMessageAndValue = logbookMessageAndValue,
                reportId = reportId,
                sentAt = sentAt,
                updatedAt = updatedAt,
                // These props need to be calculated in the use case
                port = null,
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
