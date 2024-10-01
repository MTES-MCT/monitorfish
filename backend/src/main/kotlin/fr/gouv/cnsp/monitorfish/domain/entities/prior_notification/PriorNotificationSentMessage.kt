package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

import java.time.ZonedDateTime

data class PriorNotificationSentMessage(
    val id: Int,
    val communicationMeans: String,
    val dateTimeUtc: ZonedDateTime,
    val errorMessage: String?,
    val priorNotificationReportId: String?,
    val priorNotificationSource: String,
    val recipientAddressOrNumber: String,
    val recipientName: String,
    val recipientOrganization: String,
    val success: Boolean,
)
