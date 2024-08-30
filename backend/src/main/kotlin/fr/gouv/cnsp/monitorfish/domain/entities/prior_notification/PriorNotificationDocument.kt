package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

import fr.gouv.cnsp.monitorfish.utils.CustomZonedDateTime

class PriorNotificationDocument(
    val id: String?,
    val content: ByteArray,
    val createdAt: CustomZonedDateTime,
    val fileName: String,
    val isManualPriorNotification: Boolean,
    val mimeType: String,
    val reportId: String,
    val updatedAt: CustomZonedDateTime,
)
