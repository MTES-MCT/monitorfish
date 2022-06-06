package fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions

import fr.gouv.cnsp.monitorfish.domain.entities.CommunicationMeans
import java.time.ZonedDateTime

data class BeaconMalfunctionNotification(
        val id: Int,
        val beaconMalfunctionId: Int,
        val dateTime: ZonedDateTime,
        val notificationType:  BeaconMalfunctionNotificationType,
        val communicationMeans: CommunicationMeans,
        val recipientFunction:  BeaconMalfunctionNotificationRecipientFunction,
        val recipientName:  String? = null,
        val recipientAddressOrNumber:  String)
