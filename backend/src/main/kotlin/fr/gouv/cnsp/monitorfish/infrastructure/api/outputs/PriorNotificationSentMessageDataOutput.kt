package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationSentMessage
import java.time.ZonedDateTime

data class PriorNotificationSentMessageDataOutput(
    val id: Int,
    val communicationMeans: String,
    val dateTimeUtc: ZonedDateTime,
    val errorMessage: String?,
    val recipientAddressOrNumber: String,
    val success: Boolean,
) {
    companion object {
        fun fromPriorNotificationSentMessage(
            priorNotificationSentMessage: PriorNotificationSentMessage,
        ): PriorNotificationSentMessageDataOutput {
            return PriorNotificationSentMessageDataOutput(
                id = priorNotificationSentMessage.id,
                communicationMeans = priorNotificationSentMessage.communicationMeans,
                dateTimeUtc = priorNotificationSentMessage.dateTimeUtc,
                errorMessage = priorNotificationSentMessage.errorMessage,
                recipientAddressOrNumber = priorNotificationSentMessage.recipientAddressOrNumber,
                success = priorNotificationSentMessage.success,
            )
        }
    }
}
