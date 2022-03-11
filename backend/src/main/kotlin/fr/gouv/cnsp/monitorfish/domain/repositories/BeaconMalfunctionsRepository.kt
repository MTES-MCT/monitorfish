package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunction
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.Stage
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.VesselStatus
import java.time.ZonedDateTime

interface BeaconMalfunctionsRepository {
    fun findAll(): List<BeaconMalfunction>
    fun findAllByVesselIdentifierEquals(vesselIdentifier: VesselIdentifier,
                                        value: String,
                                        afterDateTime: ZonedDateTime): List<BeaconMalfunction>
    fun findAllExceptEndOfFollowUp(): List<BeaconMalfunction>
    fun findLastThirtyEndOfFollowUp(): List<BeaconMalfunction>
    fun find(beaconMalfunctionId: Int): BeaconMalfunction
    fun update(id: Int,
               vesselStatus: VesselStatus?,
               stage: Stage?,
               updateDateTime: ZonedDateTime)
    fun findAllByVesselWithoutVesselIdentifier(internalReferenceNumber: String,
                                               externalReferenceNumber: String,
                                               ircs: String,
                                               afterDateTime: ZonedDateTime): List<BeaconMalfunction>
}
