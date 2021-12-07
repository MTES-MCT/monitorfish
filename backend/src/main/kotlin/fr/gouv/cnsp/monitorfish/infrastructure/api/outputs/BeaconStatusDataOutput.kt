package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.beacons_status.BeaconStatus
import fr.gouv.cnsp.monitorfish.domain.entities.beacons_status.Stage
import fr.gouv.cnsp.monitorfish.domain.entities.beacons_status.VesselStatus
import java.time.ZonedDateTime

data class BeaconStatusDataOutput(
        val id: Int,
        val vesselId: Int,
        val internalReferenceNumber: String?,
        val vesselStatus: VesselStatus,
        val stage: Stage,
        val priority: Boolean,
        val malfunctionStartDateTime: ZonedDateTime,
        val malfunctionEndDateTime: ZonedDateTime?,
        val vesselStatusLastModificationDateTime: ZonedDateTime) {
    companion object {
        fun fromBeaconStatus(beaconStatus: BeaconStatus): BeaconStatusDataOutput {
            return BeaconStatusDataOutput(
                    id = beaconStatus.id,
                    vesselId = beaconStatus.vesselId,
                    internalReferenceNumber = beaconStatus.internalReferenceNumber,
                    vesselStatus = beaconStatus.vesselStatus,
                    stage = beaconStatus.stage,
                    priority = beaconStatus.priority,
                    malfunctionStartDateTime = beaconStatus.malfunctionStartDateTime,
                    malfunctionEndDateTime = beaconStatus.malfunctionEndDateTime,
                    vesselStatusLastModificationDateTime  = beaconStatus.vesselStatusLastModificationDateTime)
        }
    }
}
