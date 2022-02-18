package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.VesselBeaconStatusResume
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.VesselStatus
import java.time.ZonedDateTime

data class VesselBeaconStatusResumeDataOutput(
        val numberOfBeaconsAtSea: Int,
        val numberOfBeaconsAtPort: Int,
        val lastBeaconStatusDateTime: ZonedDateTime?,
        val lastBeaconStatusVesselStatus: VesselStatus?) {
    companion object {
        fun fromVesselBeaconStatusResume(vesselBeaconStatusResume: VesselBeaconStatusResume): VesselBeaconStatusResumeDataOutput {
            return VesselBeaconStatusResumeDataOutput(
                    numberOfBeaconsAtSea = vesselBeaconStatusResume.numberOfBeaconsAtSea,
                    numberOfBeaconsAtPort = vesselBeaconStatusResume.numberOfBeaconsAtPort,
                    lastBeaconStatusDateTime = vesselBeaconStatusResume.lastBeaconStatusDateTime,
                    lastBeaconStatusVesselStatus = vesselBeaconStatusResume.lastBeaconStatusVesselStatus)
        }
    }
}
