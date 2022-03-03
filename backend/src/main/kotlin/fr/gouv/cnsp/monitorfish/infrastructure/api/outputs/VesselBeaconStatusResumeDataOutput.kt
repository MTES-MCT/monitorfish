package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.VesselBeaconMalfunctionsResume
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.VesselStatus
import java.time.ZonedDateTime

data class VesselBeaconStatusResumeDataOutput(
        val numberOfBeaconsAtSea: Int,
        val numberOfBeaconsAtPort: Int,
        val lastBeaconStatusDateTime: ZonedDateTime?,
        val lastBeaconStatusVesselStatus: VesselStatus?) {
    companion object {
        fun fromVesselBeaconStatusResume(vesselBeaconMalfunctionsResume: VesselBeaconMalfunctionsResume): VesselBeaconStatusResumeDataOutput {
            return VesselBeaconStatusResumeDataOutput(
                    numberOfBeaconsAtSea = vesselBeaconMalfunctionsResume.numberOfBeaconsAtSea,
                    numberOfBeaconsAtPort = vesselBeaconMalfunctionsResume.numberOfBeaconsAtPort,
                    lastBeaconStatusDateTime = vesselBeaconMalfunctionsResume.lastBeaconStatusDateTime,
                    lastBeaconStatusVesselStatus = vesselBeaconMalfunctionsResume.lastBeaconStatusVesselStatus)
        }
    }
}
