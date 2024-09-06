package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationDocument
import fr.gouv.cnsp.monitorfish.utils.CustomZonedDateTime
import jakarta.persistence.*
import org.hibernate.annotations.JdbcType
import org.hibernate.type.descriptor.jdbc.BinaryJdbcType
import java.time.ZonedDateTime

@Entity
@Table(name = "prior_notification_uploads")
data class PriorNotificationUploadEntity(
    @Id
    @Column(name = "id", updatable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: String?,
    @Column(name = "content", nullable = false)
    @JdbcType(BinaryJdbcType::class)
    val content: ByteArray,
    @Column(name = "created_at", nullable = false)
    val createdAt: ZonedDateTime,
    @Column(name = "file_name", nullable = false)
    val fileName: String,
    @Column(name = "is_manual_prior_notification", nullable = false)
    val isManualPriorNotification: Boolean,
    @Column(name = "mime_type", nullable = false)
    val mimeType: String,
    @Column(name = "report_id", nullable = false)
    val reportId: String,
    @Column(name = "updated_at", nullable = false)
    val updatedAt: ZonedDateTime,
) {
    fun toDocument(): PriorNotificationDocument {
        return PriorNotificationDocument(
            id = id!!,
            content = content,
            createdAt = CustomZonedDateTime.fromZonedDateTime(createdAt),
            fileName = fileName,
            isManualPriorNotification = isManualPriorNotification,
            mimeType = mimeType,
            reportId = reportId,
            updatedAt = CustomZonedDateTime.fromZonedDateTime(updatedAt),
        )
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as PriorNotificationUploadEntity

        if (id != other.id) return false
        if (!content.contentEquals(other.content)) return false
        if (createdAt != other.createdAt) return false
        if (fileName != other.fileName) return false
        if (isManualPriorNotification != other.isManualPriorNotification) return false
        if (mimeType != other.mimeType) return false
        if (reportId != other.reportId) return false
        if (updatedAt != other.updatedAt) return false

        return true
    }

    override fun hashCode(): Int {
        var result = id?.hashCode() ?: 0
        result = 31 * result + content.contentHashCode()
        result = 31 * result + createdAt.hashCode()
        result = 31 * result + fileName.hashCode()
        result = 31 * result + isManualPriorNotification.hashCode()
        result = 31 * result + mimeType.hashCode()
        result = 31 * result + reportId.hashCode()
        result = 31 * result + updatedAt.hashCode()
        return result
    }

    companion object {
        fun fromDocument(priorNotificationDocument: PriorNotificationDocument): PriorNotificationUploadEntity {
            return PriorNotificationUploadEntity(
                id = priorNotificationDocument.id,
                content = priorNotificationDocument.content,
                createdAt = priorNotificationDocument.createdAt.toZonedDateTime(),
                fileName = priorNotificationDocument.fileName,
                isManualPriorNotification = priorNotificationDocument.isManualPriorNotification,
                mimeType = priorNotificationDocument.mimeType,
                reportId = priorNotificationDocument.reportId,
                updatedAt = priorNotificationDocument.updatedAt.toZonedDateTime(),
            )
        }
    }
}
