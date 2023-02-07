package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.*
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
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
    val malfunctionStartDateTime: ZonedDateTime,
    val malfunctionEndDateTime: ZonedDateTime?,
    val vesselStatusLastModificationDateTime: ZonedDateTime,
    val endOfBeaconMalfunctionReason: EndOfBeaconMalfunctionReason? = null,
    val vesselId: Int,
    var riskFactor: Double?,
    val notificationRequested: BeaconMalfunctionNotificationType? = null,
    val beaconNumber: String? = null,
) {
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
                malfunctionStartDateTime = beaconMalfunction.malfunctionStartDateTime,
                malfunctionEndDateTime = beaconMalfunction.malfunctionEndDateTime,
                vesselStatusLastModificationDateTime = beaconMalfunction.vesselStatusLastModificationDateTime,
                endOfBeaconMalfunctionReason = beaconMalfunction.endOfBeaconMalfunctionReason,
                riskFactor = beaconMalfunction.riskFactor,
                notificationRequested = beaconMalfunction.notificationRequested,
                beaconNumber = beaconMalfunction.beaconNumber,
                vesselId = beaconMalfunction.vesselId,
            )
        }
    }
}
