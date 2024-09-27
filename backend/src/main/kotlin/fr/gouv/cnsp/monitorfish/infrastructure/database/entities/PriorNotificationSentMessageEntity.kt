package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationSentMessage
import jakarta.persistence.*
import org.hibernate.annotations.Immutable
import java.time.ZonedDateTime

@Entity
@Immutable
@Table(name = "prior_notification_sent_messages")
data class PriorNotificationSentMessageEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", unique = true, nullable = false)
    val id: Int,
    @Column(name = "communication_means", nullable = false)
    val communicationMeans: String,
    @Column(name = "date_time_utc", nullable = false)
    val dateTimeUtc: ZonedDateTime,
    @Column(name = "error_message", nullable = true)
    val errorMessage: String?,
    @Column(name = "prior_notification_report_id", nullable = false)
    val priorNotificationReportId: String?,
    @Column(name = "prior_notification_source", nullable = false)
    val priorNotificationSource: String,
    @Column(name = "recipient_address_or_number", nullable = false)
    val recipientAddressOrNumber: String,
    @Column(name = "recipient_name", nullable = false)
    val recipientName: String,
    @Column(name = "recipient_organization", nullable = false)
    val recipientOrganization: String,
    @Column(name = "success", nullable = false)
    val success: Boolean,
) {
    fun toPriorNotificationSentMessage(): PriorNotificationSentMessage {
        return PriorNotificationSentMessage(
            id = id,
            communicationMeans = communicationMeans,
            dateTimeUtc = dateTimeUtc,
            errorMessage = errorMessage,
            priorNotificationReportId = priorNotificationReportId,
            priorNotificationSource = priorNotificationSource,
            recipientAddressOrNumber = recipientAddressOrNumber,
            recipientName = recipientName,
            recipientOrganization = recipientOrganization,
            success = success,
        )
    }
}
