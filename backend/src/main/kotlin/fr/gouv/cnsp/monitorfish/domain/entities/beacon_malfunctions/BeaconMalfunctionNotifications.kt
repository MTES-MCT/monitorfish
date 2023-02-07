package fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions

import java.time.ZonedDateTime

data class BeaconMalfunctionNotifications(
    val beaconMalfunctionId: Int,
    val dateTimeUtc: ZonedDateTime,
    val notificationType: BeaconMalfunctionNotificationType,
    val notifications: List<BeaconMalfunctionNotification>,
)
