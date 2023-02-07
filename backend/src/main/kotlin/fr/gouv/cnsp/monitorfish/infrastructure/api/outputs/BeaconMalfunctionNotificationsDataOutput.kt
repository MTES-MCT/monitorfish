package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionNotificationType
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionNotifications
import java.time.ZonedDateTime

data class BeaconMalfunctionNotificationsDataOutput(
    val beaconMalfunctionId: Int,
    val dateTime: ZonedDateTime,
    val notificationType: BeaconMalfunctionNotificationType,
    val notifications: List<BeaconMalfunctionNotificationDataOutput>,
) {
    companion object {
        fun fromBeaconMalfunctionNotifications(beaconMalfunctionNotifications: BeaconMalfunctionNotifications): BeaconMalfunctionNotificationsDataOutput =
            BeaconMalfunctionNotificationsDataOutput(
                beaconMalfunctionId = beaconMalfunctionNotifications.beaconMalfunctionId,
                dateTime = beaconMalfunctionNotifications.dateTimeUtc,
                notificationType = beaconMalfunctionNotifications.notificationType,
                notifications = beaconMalfunctionNotifications.notifications
                    .map { BeaconMalfunctionNotificationDataOutput.fromBeaconMalfunctionNotification(it) },
            )
    }
}
