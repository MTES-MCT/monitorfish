package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.*
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.Type
import org.hibernate.annotations.UpdateTimestamp
import java.time.ZonedDateTime

@Entity
@Table(name = "manual_prior_notifications")
data class ManualPriorNotificationEntity(
    @Id
    @Column(name = "report_id", updatable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val reportId: String?,

    @Column(name = "cfr")
    val cfr: String?,

    // ISO Alpha-3 country code
    @Column(name = "flag_state")
    val flagState: String?,

    @Column(name = "integration_datetime_utc")
    val integrationDateTime: ZonedDateTime,

    @Column(name = "operation_datetime_utc")
    val operationDateTime: ZonedDateTime,

    @Column(name = "report_datetime_utc")
    val reportDateTime: ZonedDateTime?,

    @Column(name = "trip_gears", nullable = true, columnDefinition = "jsonb")
    @Type(JsonBinaryType::class)
    val tripGears: List<LogbookTripGear>?,

    @Column(name = "trip_segments", nullable = true, columnDefinition = "jsonb")
    @Type(JsonBinaryType::class)
    val tripSegments: List<LogbookTripSegment>?,

    @Type(JsonBinaryType::class)
    @Column(name = "value", nullable = true, columnDefinition = "jsonb")
    val value: PNO,

    @Column(name = "vessel_name")
    val vesselName: String?,

    @Column(name = "created_at", insertable = false, updatable = false)
    @CreationTimestamp
    val createdAt: ZonedDateTime? = null,

    @Column(name = "updated_at")
    @UpdateTimestamp
    var updatedAt: ZonedDateTime? = null,
) {
    companion object {
        fun fromLogbookMessageTyped(logbookMessageTyped: LogbookMessageTyped<PNO>): ManualPriorNotificationEntity {
            val pnoLogbookMessage = logbookMessageTyped.logbookMessage
            val pnoLogbookMessageValue = logbookMessageTyped.typedMessage

            return ManualPriorNotificationEntity(
                reportId = pnoLogbookMessage.reportId,
                cfr = pnoLogbookMessage.internalReferenceNumber,
                flagState = pnoLogbookMessage.flagState,
                integrationDateTime = pnoLogbookMessage.integrationDateTime,
                operationDateTime = pnoLogbookMessage.operationDateTime,
                reportDateTime = pnoLogbookMessage.reportDateTime,
                tripGears = pnoLogbookMessage.tripGears,
                tripSegments = pnoLogbookMessage.tripSegments,
                value = pnoLogbookMessageValue,
                vesselName = pnoLogbookMessage.vesselName,
                createdAt = pnoLogbookMessage.createdAt,
                updatedAt = pnoLogbookMessage.updatedAt,
            )
        }
    }

    fun toPriorNotification(): PriorNotification {
        val pnoLogbookMessage = LogbookMessage(
            id = null,
            reportId = reportId,
            analyzedByRules = emptyList(),
            integrationDateTime = integrationDateTime,
            internalReferenceNumber = cfr,
            isManuallyCreated = true,
            message = value,
            operationDateTime = operationDateTime,
            operationNumber = null,
            operationType = LogbookOperationType.DAT,
            reportDateTime = reportDateTime,
            transmissionFormat = null,
            vesselName = vesselName,
            createdAt = createdAt,
            updatedAt = updatedAt,
        )
        val fingerprint = listOf(reportId!!, updatedAt.toString()).joinToString(separator = ".")
        // For pratical reasons `vessel` can't be `null`, so we temporarely set it to "Navire inconnu"
        val vessel = Vessel(id = -1, flagState = CountryCode.UNDEFINED, hasLogbookEsacapt = false)
        val logbookMessageTyped = LogbookMessageTyped(pnoLogbookMessage, PNO::class.java)

        return PriorNotification(
            fingerprint,
            logbookMessageTyped,
            vessel = vessel,
        )
    }
}
