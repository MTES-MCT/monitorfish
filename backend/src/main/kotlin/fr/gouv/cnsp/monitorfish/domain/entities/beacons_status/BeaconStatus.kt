package fr.gouv.cnsp.monitorfish.domain.entities.beacons_status

import java.time.ZonedDateTime

data class BeaconStatus(
        val id: Int,
        val vesselId: Int,
        val internalReferenceNumber: String?,
        val vesselStatus: VesselStatus,
        val stage: Stage,
        val priority: Boolean,
        val malfunctionStartDateTime: ZonedDateTime,
        val malfunctionEndDateTime: ZonedDateTime?,
        val vesselStatusLastModificationDateTime: ZonedDateTime)
