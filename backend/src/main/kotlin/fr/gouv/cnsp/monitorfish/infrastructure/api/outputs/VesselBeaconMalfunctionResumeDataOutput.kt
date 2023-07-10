package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.VesselBeaconMalfunctionsResume
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.VesselStatus
import java.time.ZonedDateTime

data class VesselBeaconMalfunctionResumeDataOutput(
    val numberOfBeaconsAtSea: Int,
    val numberOfBeaconsAtPort: Int,
    val lastBeaconMalfunctionDateTime: ZonedDateTime?,
    val lastBeaconMalfunctionVesselStatus: VesselStatus?,
) {
    companion object {
        fun fromVesselBeaconMalfunctionResume(
            vesselBeaconMalfunctionsResume: VesselBeaconMalfunctionsResume,
        ): VesselBeaconMalfunctionResumeDataOutput {
            return VesselBeaconMalfunctionResumeDataOutput(
                numberOfBeaconsAtSea = vesselBeaconMalfunctionsResume.numberOfBeaconsAtSea,
                numberOfBeaconsAtPort = vesselBeaconMalfunctionsResume.numberOfBeaconsAtPort,
                lastBeaconMalfunctionDateTime = vesselBeaconMalfunctionsResume.lastBeaconMalfunctionDateTime,
                lastBeaconMalfunctionVesselStatus = vesselBeaconMalfunctionsResume.lastBeaconMalfunctionVesselStatus,
            )
        }
    }
}
