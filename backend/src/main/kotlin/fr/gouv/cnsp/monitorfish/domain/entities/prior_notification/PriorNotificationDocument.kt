package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

import fr.gouv.cnsp.monitorfish.utils.CustomZonedDateTime

data class PriorNotificationDocument(
    val id: String?,
    val content: ByteArray,
    val createdAt: CustomZonedDateTime,
    val fileName: String,
    val isManualPriorNotification: Boolean,
    val mimeType: String,
    val reportId: String,
    val updatedAt: CustomZonedDateTime,
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as PriorNotificationDocument

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
}
