package fr.gouv.cnsp.monitorfish.domain.use_cases.beacon_malfunction

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionNotificationType
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionsRepository

@UseCase
class RequestNotification(private val beaconMalfunctionsRepository: BeaconMalfunctionsRepository) {
    fun execute(
        id: Int,
        notificationRequested: BeaconMalfunctionNotificationType,
        requestedNotificationForeignFmcCode: String? = null,
    ) {
        when (notificationRequested) {
            BeaconMalfunctionNotificationType.MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC -> {
                requireNotNull(requestedNotificationForeignFmcCode) {
                    "requestedNotificationForeignFmcCode cannot be null when requesting a notification to a foreign FMC"
                }
                beaconMalfunctionsRepository.requestNotification(
                    id,
                    notificationRequested,
                    requestedNotificationForeignFmcCode,
                )
            }
            else -> beaconMalfunctionsRepository.requestNotification(id, notificationRequested)
        }
    }
}
