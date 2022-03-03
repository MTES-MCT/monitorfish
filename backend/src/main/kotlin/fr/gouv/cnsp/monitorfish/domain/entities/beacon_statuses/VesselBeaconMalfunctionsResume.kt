package fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses

import java.time.ZonedDateTime

data class VesselBeaconMalfunctionsResume(
        val numberOfBeaconsAtSea: Int,
        val numberOfBeaconsAtPort: Int,
        val lastBeaconStatusDateTime: ZonedDateTime?,
        val lastBeaconStatusVesselStatus: VesselStatus?) {
    companion object {
        fun fromBeaconStatuses(beaconStatusesWithDetails: List<BeaconStatusWithDetails>): VesselBeaconMalfunctionsResume {
            val oneYearBefore = ZonedDateTime.now().minusYears(1)

            val lastBeaconStatus = beaconStatusesWithDetails
                    .maxByOrNull { it.beaconStatus.malfunctionStartDateTime }

            val lastYearBeaconStatusesWithDetails = beaconStatusesWithDetails.filter {
                it.beaconStatus.malfunctionStartDateTime > oneYearBefore
            }

            val numberOfBeaconsAtSea = getNumberOfBeaconsMalfunctionsAt(VesselStatus.AT_SEA, lastYearBeaconStatusesWithDetails)
            val numberOfBeaconsAtPort = getNumberOfBeaconsMalfunctionsAt(VesselStatus.AT_PORT, lastYearBeaconStatusesWithDetails)

            return VesselBeaconMalfunctionsResume(
                    numberOfBeaconsAtSea = numberOfBeaconsAtSea,
                    numberOfBeaconsAtPort = numberOfBeaconsAtPort,
                    lastBeaconStatusDateTime = lastBeaconStatus?.beaconStatus?.malfunctionStartDateTime,
                    lastBeaconStatusVesselStatus = getLastVesselStatus(lastBeaconStatus)
            )
        }

        private fun getNumberOfBeaconsMalfunctionsAt(vesselStatus: VesselStatus,
                                                     lastYearBeaconStatusesWithDetails: List<BeaconStatusWithDetails>): Int {
            return lastYearBeaconStatusesWithDetails.filter { beaconStatusWithDetails ->
                getFirstVesselStatus(beaconStatusWithDetails) == vesselStatus
            }.size
        }

        private fun getFirstVesselStatus(beaconStatusWithDetails: BeaconStatusWithDetails): VesselStatus {
            val beaconStatusVesselStatusActions = beaconStatusWithDetails.actions
                    .filter { action -> action.propertyName == BeaconStatusActionPropertyName.VESSEL_STATUS }

            return when (beaconStatusVesselStatusActions.isEmpty()) {
                true -> beaconStatusWithDetails.beaconStatus.vesselStatus
                false -> beaconStatusVesselStatusActions
                        .minByOrNull { action -> action.dateTime }?.let { action ->
                            VesselStatus.valueOf(action.previousValue)
                        }!!
            }
        }

        private fun getLastVesselStatus(beaconStatus: BeaconStatusWithDetails?): VesselStatus? {
            val lastVesselStatus = beaconStatus?.actions?.filter { action ->
                action.propertyName == BeaconStatusActionPropertyName.VESSEL_STATUS
            }?.maxByOrNull { action -> action.dateTime }?.nextValue

            return lastVesselStatus?.let {
                VesselStatus.valueOf(lastVesselStatus)
            } ?: beaconStatus?.beaconStatus?.vesselStatus
        }
    }
}
