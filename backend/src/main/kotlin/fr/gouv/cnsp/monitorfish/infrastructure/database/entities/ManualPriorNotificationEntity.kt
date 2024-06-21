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

    @Column(name = "author_trigram")
    val authorTrigram: String,

    @Column(name = "cfr")
    val cfr: String,

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
                val pnoLogbookMessage = priorNotification.logbookMessageTyped.logbookMessage
                val pnoLogbookMessageValue = priorNotification.logbookMessageTyped.typedMessage
                val createdAt = priorNotification.createdAt?.let { ZonedDateTime.parse(it) } ?: ZonedDateTime.now()
                val updatedAt = if (isUpdate || priorNotification.updatedAt == null) {
                    ZonedDateTime.now()
                } else {
                    ZonedDateTime.parse(priorNotification.updatedAt)
                }

                return ManualPriorNotificationEntity(
                    reportId = pnoLogbookMessage.reportId,
                    authorTrigram = requireNotNull(priorNotification.authorTrigram),
                    cfr = requireNotNull(pnoLogbookMessage.internalReferenceNumber),
                    createdAt = createdAt,
                    didNotFishAfterZeroNotice = priorNotification.didNotFishAfterZeroNotice,
                    flagState = pnoLogbookMessage.flagState,
                    sentAt = ZonedDateTime.parse(requireNotNull(priorNotification.sentAt)),
                    tripGears = pnoLogbookMessage.tripGears,
                    tripSegments = pnoLogbookMessage.tripSegments,
                    updatedAt = updatedAt,
                    value = pnoLogbookMessageValue,
                    vesselName = pnoLogbookMessage.vesselName,
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

            val pnoLogbookMessage = LogbookMessage(
                id = null,
                reportId = reportId,
                analyzedByRules = emptyList(),
                flagState = flagState,
                isEnriched = true,
                integrationDateTime = createdAt,
                internalReferenceNumber = cfr,
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
            )
            // For pratical reasons `vessel` can't be `null`, so we temporarely set it to "Navire inconnu"
            val vessel = UNKNOWN_VESSEL
            val logbookMessageTyped = LogbookMessageTyped(pnoLogbookMessage, PNO::class.java)

            return PriorNotification(
                authorTrigram = authorTrigram,
                createdAt = createdAt.toString(),
                didNotFishAfterZeroNotice = didNotFishAfterZeroNotice,
                isManuallyCreated = true,
                logbookMessageTyped = logbookMessageTyped,
                reportId = reportId,
                sentAt = sentAt.toString(),
                updatedAt = updatedAt.toString(),

                // These props need to be calculated in the use case
                port = null,
                reportingCount = null,
                seafront = null,
                state = null,
                vessel = vessel,
                vesselRiskFactor = null,
            )
        } catch (e: IllegalArgumentException) {
            throw BackendInternalException(
                "Error while converting `ManualPriorNotificationEntity` to `PriorNotification` (likely because a non-nullable variable is null).",
                e,
            )
        }
    }
}
