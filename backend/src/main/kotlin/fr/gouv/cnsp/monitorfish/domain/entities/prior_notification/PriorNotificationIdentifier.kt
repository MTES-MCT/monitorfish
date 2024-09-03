package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

import java.time.ZonedDateTime

data class PriorNotificationIdentifier(
    val reportId: String,
    val operationDate: ZonedDateTime,
    val isManualPriorNotification: Boolean,
)
