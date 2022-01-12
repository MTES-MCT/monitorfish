package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusAction

interface BeaconStatusActionsRepository {
    fun findAllByBeaconStatusId(beaconStatusId: Int): List<BeaconStatusAction>
    fun BeaconStatusAction.save()
}
