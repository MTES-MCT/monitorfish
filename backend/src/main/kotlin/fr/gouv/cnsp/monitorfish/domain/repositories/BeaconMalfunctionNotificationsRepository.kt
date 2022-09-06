package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionNotification

interface BeaconMalfunctionNotificationsRepository {
    fun findAllByBeaconMalfunctionId(beaconMalfunctionId: Int): List<BeaconMalfunctionNotification>
}
