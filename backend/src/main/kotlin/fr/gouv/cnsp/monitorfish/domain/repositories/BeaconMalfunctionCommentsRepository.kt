package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionComment

interface BeaconMalfunctionCommentsRepository {
    fun findAllByBeaconMalfunctionId(beaconMalfunctionId: Int): List<BeaconMalfunctionComment>

    fun save(beaconMalfunctionComment: BeaconMalfunctionComment)
}
