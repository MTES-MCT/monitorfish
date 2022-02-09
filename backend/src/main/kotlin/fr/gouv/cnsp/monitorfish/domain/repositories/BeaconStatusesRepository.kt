package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatus
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.Stage
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.VesselStatus
import java.time.ZonedDateTime

interface BeaconStatusesRepository {
    fun findAll(): List<BeaconStatus>
    fun findAllExceptEndOfFollowUp(): List<BeaconStatus>
    fun findLastThirtyEndOfFollowUp(): List<BeaconStatus>
    fun find(beaconStatusId: Int): BeaconStatus
    fun update(id: Int,
               vesselStatus: VesselStatus?,
               stage: Stage?,
               updateDateTime: ZonedDateTime)
}
