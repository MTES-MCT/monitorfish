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

            val lastBeaconStatus = beaconStatusesWithDetails
                    .maxByOrNull { it.beaconStatus.malfunctionStartDateTime }

            val lastYearBeaconStatusesWithDetails = beaconStatusesWithDetails.filter {
                it.beaconStatus.malfunctionStartDateTime > oneYearBefore
            }

            val numberOfBeaconsAtSea = getNumberOfBeaconsAt(VesselStatus.AT_SEA, lastYearBeaconStatusesWithDetails, lastBeaconStatus)
            val numberOfBeaconsAtPort = getNumberOfBeaconsAt(VesselStatus.AT_PORT, lastYearBeaconStatusesWithDetails, lastBeaconStatus)

            return VesselBeaconStatusResume(
                    numberOfBeaconsAtSea = numberOfBeaconsAtSea,
                    numberOfBeaconsAtPort = numberOfBeaconsAtPort,
                    lastBeaconStatusDateTime = lastBeaconStatus?.beaconStatus?.malfunctionStartDateTime,
                    lastBeaconStatusVesselStatus = getLastVesselStatus(lastBeaconStatus)
            )
        }

        private fun getNumberOfBeaconsAt(vesselStatus: VesselStatus,
                                         lastYearBeaconStatusesWithDetails: List<BeaconStatusWithDetails>,
                                         lastBeaconStatus: BeaconStatusWithDetails?): Int {
            val lastBeaconStatusHasNoVesselStatusAction = lastBeaconStatus?.actions
                    ?.filter { action -> action.propertyName == BeaconStatusActionPropertyName.VESSEL_STATUS }
                    ?.size == 0

            var numberOfBeaconsAtSeaOrPort = lastYearBeaconStatusesWithDetails.filter {
                it.actions
                        .filter { action -> action.propertyName == BeaconStatusActionPropertyName.VESSEL_STATUS }
                        .minByOrNull { action -> action.dateTime }?.let { action ->
                            VesselStatus.valueOf(action.previousValue) == vesselStatus
                        } ?: false
            }.size

            if (lastBeaconStatusHasNoVesselStatusAction && lastBeaconStatus?.beaconStatus?.vesselStatus == vesselStatus) {
                numberOfBeaconsAtSeaOrPort += 1
            }

            return numberOfBeaconsAtSeaOrPort
        }

        private fun getLastVesselStatus(lastBeaconStatus: BeaconStatusWithDetails?): VesselStatus? {
            val lastVesselStatus = lastBeaconStatus?.actions?.filter { action ->
                action.propertyName == BeaconStatusActionPropertyName.VESSEL_STATUS
            }?.maxByOrNull { action -> action.dateTime }?.nextValue

            return lastVesselStatus?.let {
                VesselStatus.valueOf(lastVesselStatus)
            } ?: lastBeaconStatus?.beaconStatus?.vesselStatus
        }
    }
}
