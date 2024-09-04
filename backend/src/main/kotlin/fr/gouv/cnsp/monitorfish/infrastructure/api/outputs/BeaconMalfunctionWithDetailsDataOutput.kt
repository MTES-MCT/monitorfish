package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionWithDetails

data class BeaconMalfunctionWithDetailsDataOutput(
    val beaconMalfunction: BeaconMalfunctionDataOutput,
    val comments: List<BeaconMalfunctionCommentDataOutput>,
    val actions: List<BeaconMalfunctionActionDataOutput>,
) {
    companion object {
        fun fromBeaconMalfunctionWithDetails(
            beaconMalfunctionWithDetails: BeaconMalfunctionWithDetails,
        ): BeaconMalfunctionWithDetailsDataOutput {
            return BeaconMalfunctionWithDetailsDataOutput(
                beaconMalfunction =
                    BeaconMalfunctionDataOutput.fromBeaconMalfunction(
                        beaconMalfunctionWithDetails.beaconMalfunction,
                    ),
                comments =
                    beaconMalfunctionWithDetails.comments.map {
                        BeaconMalfunctionCommentDataOutput.fromBeaconMalfunctionComment(
                            it,
                        )
                    },
                actions =
                    beaconMalfunctionWithDetails.actions.map {
                        BeaconMalfunctionActionDataOutput.fromBeaconMalfunctionAction(
                            it,
                        )
                    },
            )
        }
    }
}
