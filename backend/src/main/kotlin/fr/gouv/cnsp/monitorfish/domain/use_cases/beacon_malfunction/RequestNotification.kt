package fr.gouv.cnsp.monitorfish.domain.use_cases.beacon_malfunction

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionNotificationType
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionsRepository

@UseCase
class RequestNotification(private val beaconMalfunctionsRepository: BeaconMalfunctionsRepository) {
  fun execute(id: Int, notificationRequested: BeaconMalfunctionNotificationType) {
    beaconMalfunctionsRepository.requestNotification(id, notificationRequested)
  }
}
