package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.CommunicationMeans
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionNotification
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionNotificationRecipientFunction
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionNotificationType
import jakarta.persistence.*
import java.time.Instant
import java.time.ZoneOffset

@Entity
@Table(name = "beacon_malfunction_notifications")
data class BeaconMalfunctionNotificationEntity(
    @Id
    @Column(name = "id", unique = true, nullable = false)
    val id: Int,
    @Column(name = "beacon_malfunction_id")
    val beaconMalfunctionId: Int,
    @Column(name = "date_time_utc")
    val dateTimeUtc: Instant,
    @Column(name = "notification_type")
    @Enumerated(EnumType.STRING)
    val notificationType: BeaconMalfunctionNotificationType,
    @Column(name = "communication_means")
    @Enumerated(EnumType.STRING)
    val communicationMeans: CommunicationMeans,
    @Column(name = "recipient_function")
    @Enumerated(EnumType.STRING)
    val recipientFunction: BeaconMalfunctionNotificationRecipientFunction,
    @Column(name = "recipient_name")
    val recipientName: String? = null,
    @Column(name = "recipient_address_or_number")
    val recipientAddressOrNumber: String,
    @Column(name = "success")
    val success: Boolean? = null,
    @Column(name = "error_message")
    val errorMessage: String? = null
) {

    fun toBeaconMalfunctionNotification() = BeaconMalfunctionNotification(
        id = id,
        beaconMalfunctionId = beaconMalfunctionId,
        dateTimeUtc = dateTimeUtc.atZone(ZoneOffset.UTC),
        notificationType = notificationType,
        communicationMeans = communicationMeans,
        recipientFunction = recipientFunction,
        recipientName = recipientName,
        recipientAddressOrNumber = recipientAddressOrNumber,
        success = success,
        errorMessage = errorMessage
    )
}
