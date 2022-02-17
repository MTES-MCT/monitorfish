package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatus
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.Stage
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.VesselStatus
import java.time.ZonedDateTime

interface BeaconStatusesRepository {
    fun findAll(): List<BeaconStatus>
    fun findAllByVesselIdentifierEquals(vesselIdentifier: VesselIdentifier, value: String): List<BeaconStatus>
    fun findAllExceptResumedTransmission(): List<BeaconStatus>
    fun findLastThirtyResumedTransmissions(): List<BeaconStatus>
    fun find(beaconStatusId: Int): BeaconStatus
    fun update(id: Int,
               vesselStatus: VesselStatus?,
               stage: Stage?,
               updateDateTime: ZonedDateTime)
}
