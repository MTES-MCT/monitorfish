package fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions

import java.time.ZonedDateTime

data class VesselBeaconMalfunctionsResume(
    val numberOfBeaconsAtSea: Int,
    val numberOfBeaconsAtPort: Int,
    val lastBeaconMalfunctionDateTime: ZonedDateTime?,
    val lastBeaconMalfunctionVesselStatus: VesselStatus?,
) {
    companion object {
        fun fromBeaconMalfunctions(beaconMalfunctionsWithDetails: List<BeaconMalfunctionWithDetails>): VesselBeaconMalfunctionsResume {
            val oneYearBefore = ZonedDateTime.now().minusYears(1)

            val lastBeaconMalfunction = beaconMalfunctionsWithDetails
                .maxByOrNull { it.beaconMalfunction.malfunctionStartDateTime }

            val lastYearBeaconMalfunctionsWithDetails = beaconMalfunctionsWithDetails.filter {
                it.beaconMalfunction.malfunctionStartDateTime > oneYearBefore
            }

            val numberOfBeaconsAtSea = getNumberOfBeaconsMalfunctionsAt(
                VesselStatus.AT_SEA,
                lastYearBeaconMalfunctionsWithDetails,
            )
            val numberOfBeaconsAtPort = getNumberOfBeaconsMalfunctionsAt(
                VesselStatus.AT_PORT,
                lastYearBeaconMalfunctionsWithDetails,
            )

            return VesselBeaconMalfunctionsResume(
                numberOfBeaconsAtSea = numberOfBeaconsAtSea,
                numberOfBeaconsAtPort = numberOfBeaconsAtPort,
                lastBeaconMalfunctionDateTime = lastBeaconMalfunction?.beaconMalfunction?.malfunctionStartDateTime,
                lastBeaconMalfunctionVesselStatus = getLastVesselStatus(lastBeaconMalfunction),
            )
        }

        private fun getNumberOfBeaconsMalfunctionsAt(
            vesselStatus: VesselStatus,
            lastYearBeaconMalfunctionsWithDetails: List<BeaconMalfunctionWithDetails>,
        ): Int {
            return lastYearBeaconMalfunctionsWithDetails.filter { beaconMalfunctionsWithDetails ->
                getFirstVesselStatus(beaconMalfunctionsWithDetails) == vesselStatus
            }.size
        }

        private fun getFirstVesselStatus(beaconMalfunctionsWithDetails: BeaconMalfunctionWithDetails): VesselStatus {
            val beaconMalfunctionVesselStatusActions = beaconMalfunctionsWithDetails.actions
                .filter { action -> action.propertyName == BeaconMalfunctionActionPropertyName.VESSEL_STATUS }

            return when (beaconMalfunctionVesselStatusActions.isEmpty()) {
                true -> beaconMalfunctionsWithDetails.beaconMalfunction.vesselStatus
                false ->
                    beaconMalfunctionVesselStatusActions
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
