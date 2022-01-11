package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusComment

interface BeaconStatusCommentsRepository {
    fun findAllByBeaconStatusId(beaconStatusId: Int): List<BeaconStatusComment>
    fun save(beaconStatusComment: BeaconStatusComment)
}
