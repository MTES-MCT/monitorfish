package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationCheck
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.converters.CustomZonedDateTimeConverter
import fr.gouv.cnsp.monitorfish.utils.CustomZonedDateTime
import jakarta.persistence.*

@Entity
@Table(name = "prior_notification_checks")
data class PriorNotificationCheckEntity(
    @Id
    @Column(name = "report_id", updatable = false)
    val reportId: String?,

    @Column(name = "created_at", updatable = false)
    @Convert(converter = CustomZonedDateTimeConverter::class)
    val createdAt: CustomZonedDateTime,

    @Column(name = "is_in_verification_scope")
    val isInVerificationScope: Boolean,

    @Column(name = "is_verified")
    val isVerified: Boolean,

    @Column(name = "is_pending_send")
    val isPendingSend: Boolean,

    @Column(name = "is_sent")
    val isSent: Boolean,

    @Column(name = "updated_at")
    @Convert(converter = CustomZonedDateTimeConverter::class)
    val updatedAt: CustomZonedDateTime,
) {
    companion object {
        fun fromPriorNotificationCheck(
            priorNotificationCheck: PriorNotificationCheck,
            isUpdate: Boolean = false,
        ): PriorNotificationCheckEntity {
            val createdAt = CustomZonedDateTime.parse(priorNotificationCheck.createdAt)
            val updatedAt = if (isUpdate) {
                CustomZonedDateTime.now()
            } else {
                CustomZonedDateTime.parse(priorNotificationCheck.updatedAt)
            }

            return PriorNotificationCheckEntity(
                reportId = priorNotificationCheck.reportId,
                createdAt = createdAt,
                isInVerificationScope = priorNotificationCheck.isInVerificationScope,
                isVerified = priorNotificationCheck.isVerified,
                isPendingSend = priorNotificationCheck.isPendingSend,
                isSent = priorNotificationCheck.isSent,
                updatedAt = updatedAt,
            )
        }
    }

    fun toPriorNotificationCheck(): PriorNotificationCheck {
        return PriorNotificationCheck(
            reportId = requireNotNull(reportId),
            createdAt = createdAt.toString(),
            isInVerificationScope = isInVerificationScope,
            isVerified = isVerified,
            isPendingSend = isPendingSend,
            isSent = isSent,
            updatedAt = updatedAt.toString(),
        )
    }
}
