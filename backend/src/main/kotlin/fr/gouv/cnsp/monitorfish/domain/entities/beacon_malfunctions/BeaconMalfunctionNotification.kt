package fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions

import fr.gouv.cnsp.monitorfish.domain.entities.CommunicationMeans
import java.time.ZonedDateTime

data class BeaconMalfunctionNotification(
    val id: Int,
    val beaconMalfunctionId: Int,
    val dateTimeUtc: ZonedDateTime,
    val notificationType: BeaconMalfunctionNotificationType,
    val communicationMeans: CommunicationMeans,
    val recipientFunction: BeaconMalfunctionNotificationRecipientFunction,
    val recipientName: String? = null,
    val recipientAddressOrNumber: String,
    val success: Boolean? = null,
    val errorMessage: String? = null,
) {
    data class NotificationGroupByKeys(
        val beaconMalfunctionId: Int,
        val dateTimeUtc: ZonedDateTime,
        val notificationType: BeaconMalfunctionNotificationType,
    )

    fun toGroupByKeys() = NotificationGroupByKeys(beaconMalfunctionId, dateTimeUtc.withNano(0), notificationType)
}
