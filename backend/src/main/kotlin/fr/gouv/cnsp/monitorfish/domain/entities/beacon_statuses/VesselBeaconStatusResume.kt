package fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses

import java.time.ZonedDateTime

data class VesselBeaconStatusResume(
        val numberOfBeaconsAtSea: Int,
        val numberOfBeaconsAtPort: Int,
        val lastBeaconStatusDateTime: ZonedDateTime?,
        val lastBeaconStatusVesselStatus: VesselStatus?) {
    companion object {
        fun fromBeaconStatuses(beaconStatusesWithDetails: List<BeaconStatusWithDetails>): VesselBeaconStatusResume {
            val oneYearBefore = ZonedDateTime.now().minusYears(1)

            val lastYearBeaconStatusesWithDetails = beaconStatusesWithDetails.filter {
                it.beaconStatus.malfunctionStartDateTime > oneYearBefore
            }

            val numberOfBeaconsAtSea = lastYearBeaconStatusesWithDetails.filter {
                it.actions
                        .filter { action -> action.propertyName == BeaconStatusActionPropertyName.VESSEL_STATUS }
                        .minByOrNull { action -> action.dateTime }?.let { action ->
                            VesselStatus.valueOf(action.previousValue) == VesselStatus.AT_SEA
                        } ?: false
            }.size

            val numberOfBeaconsAtPort = lastYearBeaconStatusesWithDetails.filter {
                it.actions
                        .filter { action -> action.propertyName == BeaconStatusActionPropertyName.VESSEL_STATUS }
                        .minByOrNull { action -> action.dateTime }?.let { action ->
                            VesselStatus.valueOf(action.previousValue) == VesselStatus.AT_PORT
                        } ?: false
            }.size

            val lastBeaconStatus = beaconStatusesWithDetails
                    .maxByOrNull { it.beaconStatus.malfunctionStartDateTime }

            return VesselBeaconStatusResume(
                    numberOfBeaconsAtSea = numberOfBeaconsAtSea,
                    numberOfBeaconsAtPort = numberOfBeaconsAtPort,
                    lastBeaconStatusDateTime = lastBeaconStatus?.beaconStatus?.malfunctionStartDateTime,
                    lastBeaconStatusVesselStatus = getLastVesselStatus(lastBeaconStatus)
            )
        }

        private fun getLastVesselStatus(lastBeaconStatus: BeaconStatusWithDetails?): VesselStatus? {
            val lastVesselStatus = lastBeaconStatus?.actions?.filter { action ->
                action.propertyName == BeaconStatusActionPropertyName.VESSEL_STATUS
            }?.maxByOrNull { action -> action.dateTime }?.nextValue

            return lastVesselStatus?.let {
                VesselStatus.valueOf(lastVesselStatus)
            }
        }
    }
}
