package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunction
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.EndOfBeaconMalfunctionReason
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.Stage
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.VesselStatus
import java.time.ZonedDateTime

data class BeaconMalfunctionDataOutput(
        val id: Int,
        val internalReferenceNumber: String?,
        val externalReferenceNumber: String?,
        val ircs: String?,
        val flagState: String?,
        val vesselIdentifier: VesselIdentifier?,
        val vesselName: String,
        val vesselStatus: VesselStatus,
        val stage: Stage,
        val priority: Boolean,
        val malfunctionStartDateTime: ZonedDateTime,
        val malfunctionEndDateTime: ZonedDateTime?,
        val vesselStatusLastModificationDateTime: ZonedDateTime,
        val endOfBeaconMalfunctionReason: EndOfBeaconMalfunctionReason? = null,
        var riskFactor: Double?) {
    companion object {
        fun fromBeaconMalfunction(beaconMalfunction: BeaconMalfunction): BeaconMalfunctionDataOutput {
            return BeaconMalfunctionDataOutput(
                    id = beaconMalfunction.id,
                    internalReferenceNumber = beaconMalfunction.internalReferenceNumber,
                    ircs = beaconMalfunction.ircs,
                    externalReferenceNumber = beaconMalfunction.externalReferenceNumber,
                    vesselName = beaconMalfunction.vesselName,
                    flagState = beaconMalfunction.flagState,
                    vesselIdentifier = beaconMalfunction.vesselIdentifier,
                    vesselStatus = beaconMalfunction.vesselStatus,
                    stage = beaconMalfunction.stage,
                    priority = beaconMalfunction.priority,
                    malfunctionStartDateTime = beaconMalfunction.malfunctionStartDateTime,
                    malfunctionEndDateTime = beaconMalfunction.malfunctionEndDateTime,
                    vesselStatusLastModificationDateTime = beaconMalfunction.vesselStatusLastModificationDateTime,
                    endOfBeaconMalfunctionReason = beaconMalfunction.endOfBeaconMalfunctionReason,
                    riskFactor = beaconMalfunction.riskFactor)
        }
    }
}
