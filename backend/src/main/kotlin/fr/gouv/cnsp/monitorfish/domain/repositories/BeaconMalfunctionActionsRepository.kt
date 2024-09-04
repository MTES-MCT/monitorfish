package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionAction

interface BeaconMalfunctionActionsRepository {
    fun findAllByBeaconMalfunctionId(beaconMalfunctionId: Int): List<BeaconMalfunctionAction>

    fun save(beaconMalfunctionAction: BeaconMalfunctionAction)
}
