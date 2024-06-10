package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.*
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.UNKNOWN_VESSEL
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendInternalException
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.Type
import org.hibernate.annotations.UpdateTimestamp
import java.time.Instant
import java.time.ZoneOffset
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

    @Column(name = "created_at", insertable = false, updatable = false)
    @CreationTimestamp
    val createdAt: ZonedDateTime? = null,

    @Column(name = "did_not_fish_after_zero_notice")
    val didNotFishAfterZeroNotice: Boolean,

    // ISO Alpha-3 country code
    @Column(name = "flag_state")
    val flagState: String?,

    @Column(name = "note")
    val note: String?,

    @Column(name = "sent_at")
    val sentAt: ZonedDateTime,

    @Column(name = "trip_gears", nullable = true, columnDefinition = "jsonb")
    @Type(JsonBinaryType::class)
    val tripGears: List<LogbookTripGear>?,

    @Column(name = "trip_segments", nullable = true, columnDefinition = "jsonb")
    @Type(JsonBinaryType::class)
    val tripSegments: List<LogbookTripSegment>?,

    @Column(name = "updated_at")
    @UpdateTimestamp
    val updatedAt: ZonedDateTime? = null,

    @Column(name = "value", nullable = true, columnDefinition = "jsonb")
    @Type(JsonBinaryType::class)
    val value: PNO,

    @Column(name = "vessel_name")
    val vesselName: String?,
) {

    companion object {
        fun fromPriorNotification(priorNotification: PriorNotification): ManualPriorNotificationEntity {
            try {
                val pnoLogbookMessage = priorNotification.logbookMessageTyped.logbookMessage
                val pnoLogbookMessageValue = priorNotification.logbookMessageTyped.typedMessage
                val createdAt = priorNotification.createdAt?.let { ZonedDateTime.parse(it) }
                val updatedAt = priorNotification.updatedAt?.let { ZonedDateTime.parse(it) }

                return ManualPriorNotificationEntity(
                    reportId = pnoLogbookMessage.reportId,
                    authorTrigram = requireNotNull(priorNotification.authorTrigram),
                    cfr = requireNotNull(pnoLogbookMessage.internalReferenceNumber),
                    createdAt = createdAt,
                    didNotFishAfterZeroNotice = priorNotification.didNotFishAfterZeroNotice,
                    flagState = pnoLogbookMessage.flagState,
                    note = priorNotification.note,
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
            val createdAt = getUtcZonedDateTime(createdAt, reportId)

            val pnoLogbookMessage = LogbookMessage(
                id = null,
                reportId = requireNotNull(reportId),
                analyzedByRules = emptyList(),
                isEnriched = true,
                integrationDateTime = createdAt,
                internalReferenceNumber = cfr,
                message = value,
                messageType = "PNO",
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
                note = note,
                reportId = reportId,
                sentAt = sentAt.toString(),
                updatedAt = updatedAt.toString(),

                // These props need to be calculated in the use case
                port = null,
                reportingCount = null,
                seafront = null,
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

    private fun getUtcZonedDateTime(dateTime: ZonedDateTime?, reportId: String?): ZonedDateTime {
        return if (dateTime != null) {
            dateTime
        } else {
            // TODO Impossible to add a `logger` property in this class.
            // logger.warn("`dateTime` is null for reportId=$reportId. Replaced by EPOCH date.")
            println("WARNING: `dateTime` is null for reportId=$reportId. Replaced by EPOCH date.")

            ZonedDateTime.ofInstant(Instant.EPOCH, ZoneOffset.UTC)
        }
    }
}
