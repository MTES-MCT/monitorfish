package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatus
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.Stage
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.VesselStatus
import java.time.ZonedDateTime

data class BeaconStatusDataOutput(
        val id: Int,
        val internalReferenceNumber: String?,
        val externalReferenceNumber: String?,
        val ircs: String?,
        val vesselIdentifier: VesselIdentifier,
        val vesselName: String,
        val vesselStatus: VesselStatus,
        val stage: Stage,
        val priority: Boolean,
        val malfunctionStartDateTime: ZonedDateTime,
        val malfunctionEndDateTime: ZonedDateTime?,
        val vesselStatusLastModificationDateTime: ZonedDateTime,
        var riskFactor: Double?) {
    companion object {
        fun fromBeaconStatus(beaconStatus: BeaconStatus): BeaconStatusDataOutput {
            return BeaconStatusDataOutput(
                    id = beaconStatus.id,
                    internalReferenceNumber = beaconStatus.internalReferenceNumber,
                    ircs = beaconStatus.ircs,
                    externalReferenceNumber = beaconStatus.externalReferenceNumber,
                    vesselName = beaconStatus.vesselName,
                    vesselIdentifier = beaconStatus.vesselIdentifier,
                    vesselStatus = beaconStatus.vesselStatus,
                    stage = beaconStatus.stage,
                    priority = beaconStatus.priority,
                    malfunctionStartDateTime = beaconStatus.malfunctionStartDateTime,
                    malfunctionEndDateTime = beaconStatus.malfunctionEndDateTime,
                    vesselStatusLastModificationDateTime = beaconStatus.vesselStatusLastModificationDateTime,
                    riskFactor = beaconStatus.riskFactor)
        }
    }
}
