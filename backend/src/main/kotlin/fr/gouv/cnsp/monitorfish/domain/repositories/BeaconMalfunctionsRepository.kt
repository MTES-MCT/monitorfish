package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.*
import java.time.ZonedDateTime

interface BeaconMalfunctionsRepository {
    fun findAll(): List<BeaconMalfunction>
    fun findAllByVesselId(vesselId: Int, afterDateTime: ZonedDateTime): List<BeaconMalfunction>
    fun findAllExceptArchived(): List<BeaconMalfunction>
    fun findLastSixtyArchived(): List<BeaconMalfunction>
    fun find(beaconMalfunctionId: Int): BeaconMalfunction
    fun update(
        id: Int,
        vesselStatus: VesselStatus?,
        stage: Stage?,
        endOfBeaconMalfunctionReason: EndOfBeaconMalfunctionReason?,
        updateDateTime: ZonedDateTime,
    )
    fun requestNotification(
        id: Int,
        notificationType: BeaconMalfunctionNotificationType,
        requestedNotificationForeignFmcCode: String? = null,
    )
}
