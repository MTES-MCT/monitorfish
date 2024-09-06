package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationDocument
import fr.gouv.cnsp.monitorfish.utils.CustomZonedDateTime

class PriorNotificationUploadDataOutput(
    val id: String,
    val createdAt: CustomZonedDateTime,
    val fileName: String,
    val isManualPriorNotification: Boolean,
    val mimeType: String,
    val reportId: String,
    val updatedAt: CustomZonedDateTime,
) {
    companion object {
        fun fromPriorNotificationDocument(priorNotificationDocument: PriorNotificationDocument): PriorNotificationUploadDataOutput {
            val id = requireNotNull(priorNotificationDocument.id) {
                "`id` is null."
            }

            return PriorNotificationUploadDataOutput(
                id = id,
                createdAt = priorNotificationDocument.createdAt,
                fileName = priorNotificationDocument.fileName,
                isManualPriorNotification = priorNotificationDocument.isManualPriorNotification,
                mimeType = priorNotificationDocument.mimeType,
                reportId = priorNotificationDocument.reportId,
                updatedAt = priorNotificationDocument.updatedAt,
            )
        }
    }
}
