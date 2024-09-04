package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.CommunicationMeans
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionNotification
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionNotificationRecipientFunction
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionNotificationType
import java.time.ZonedDateTime

data class BeaconMalfunctionNotificationDataOutput(
    val beaconMalfunctionId: Int,
    val dateTime: ZonedDateTime,
    val notificationType: BeaconMalfunctionNotificationType,
    val communicationMeans: CommunicationMeans,
    val recipientFunction: BeaconMalfunctionNotificationRecipientFunction,
    val recipientName: String?,
    val recipientAddressOrNumber: String,
    val success: Boolean?,
    val errorMessage: String?,
) {
    companion object {
        fun fromBeaconMalfunctionNotification(
            beaconMalfunctionNotification: BeaconMalfunctionNotification,
        ): BeaconMalfunctionNotificationDataOutput {
            return BeaconMalfunctionNotificationDataOutput(
                beaconMalfunctionId = beaconMalfunctionNotification.beaconMalfunctionId,
                dateTime = beaconMalfunctionNotification.dateTimeUtc,
                notificationType = beaconMalfunctionNotification.notificationType,
                communicationMeans = beaconMalfunctionNotification.communicationMeans,
                recipientFunction = beaconMalfunctionNotification.recipientFunction,
                recipientName = beaconMalfunctionNotification.recipientName,
                recipientAddressOrNumber = beaconMalfunctionNotification.recipientAddressOrNumber,
                success = beaconMalfunctionNotification.success,
                errorMessage = beaconMalfunctionNotification.errorMessage,
            )
        }
    }
}
