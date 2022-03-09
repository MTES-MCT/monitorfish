package fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions

import java.time.ZonedDateTime

data class VesselBeaconMalfunctionsResume(
        val numberOfBeaconsAtSea: Int,
        val numberOfBeaconsAtPort: Int,
        val lastBeaconStatusDateTime: ZonedDateTime?,
        val lastBeaconStatusVesselStatus: VesselStatus?) {
    companion object {
        fun fromBeaconMalfunctions(beaconMalfunctionsWithDetails: List<BeaconMalfunctionWithDetails>): VesselBeaconMalfunctionsResume {
            val oneYearBefore = ZonedDateTime.now().minusYears(1)

            val lastBeaconStatus = beaconMalfunctionsWithDetails
                    .maxByOrNull { it.beaconMalfunction.malfunctionStartDateTime }

            val lastYearBeaconStatusesWithDetails = beaconMalfunctionsWithDetails.filter {
                it.beaconMalfunction.malfunctionStartDateTime > oneYearBefore
            }

            val numberOfBeaconsAtSea = getNumberOfBeaconsMalfunctionsAt(VesselStatus.AT_SEA, lastYearBeaconStatusesWithDetails)
            val numberOfBeaconsAtPort = getNumberOfBeaconsMalfunctionsAt(VesselStatus.AT_PORT, lastYearBeaconStatusesWithDetails)

            return VesselBeaconMalfunctionsResume(
                    numberOfBeaconsAtSea = numberOfBeaconsAtSea,
                    numberOfBeaconsAtPort = numberOfBeaconsAtPort,
                    lastBeaconStatusDateTime = lastBeaconStatus?.beaconMalfunction?.malfunctionStartDateTime,
                    lastBeaconStatusVesselStatus = getLastVesselStatus(lastBeaconStatus)
            )
        }

        private fun getNumberOfBeaconsMalfunctionsAt(vesselStatus: VesselStatus,
                                                     lastYearBeaconMalfunctionsWithDetails: List<BeaconMalfunctionWithDetails>): Int {
            return lastYearBeaconMalfunctionsWithDetails.filter { beaconStatusWithDetails ->
                getFirstVesselStatus(beaconStatusWithDetails) == vesselStatus
            }.size
        }

        private fun getFirstVesselStatus(beaconMalfunctionsWithDetails: BeaconMalfunctionWithDetails): VesselStatus {
            val beaconStatusVesselStatusActions = beaconMalfunctionsWithDetails.actions
                    .filter { action -> action.propertyName == BeaconMalfunctionActionPropertyName.VESSEL_STATUS }

            return when (beaconStatusVesselStatusActions.isEmpty()) {
                true -> beaconMalfunctionsWithDetails.beaconMalfunction.vesselStatus
                false -> beaconStatusVesselStatusActions
                        .minByOrNull { action -> action.dateTime }?.let { action ->
                            VesselStatus.valueOf(action.previousValue)
                        }!!
            }
        }

        private fun getLastVesselStatus(beaconMalfunction: BeaconMalfunctionWithDetails?): VesselStatus? {
            val lastVesselStatus = beaconMalfunction?.actions?.filter { action ->
                action.propertyName == BeaconMalfunctionActionPropertyName.VESSEL_STATUS
            }?.maxByOrNull { action -> action.dateTime }?.nextValue

            return lastVesselStatus?.let {
                VesselStatus.valueOf(lastVesselStatus)
            } ?: beaconMalfunction?.beaconMalfunction?.vesselStatus
        }
    }
}
