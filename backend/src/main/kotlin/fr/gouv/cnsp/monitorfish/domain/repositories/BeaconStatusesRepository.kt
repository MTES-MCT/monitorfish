package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacons_status.BeaconStatus

interface BeaconStatusesRepository {
    fun findAll(): List<BeaconStatus>
}
