package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionResumeAndDetails

data class BeaconMalfunctionResumeAndDetailsDataOutput(
    val beaconMalfunction: BeaconMalfunctionDataOutput,
    val resume: VesselBeaconMalfunctionResumeDataOutput? = null,
    val comments: List<BeaconMalfunctionCommentDataOutput>,
    val actions: List<BeaconMalfunctionActionDataOutput>,
    val notifications: List<BeaconMalfunctionNotificationsDataOutput>,
) {
    companion object {
        fun fromBeaconMalfunctionResumeAndDetails(
            beaconMalfunctionResumeAndDetails: BeaconMalfunctionResumeAndDetails,
        ): BeaconMalfunctionResumeAndDetailsDataOutput {
            return BeaconMalfunctionResumeAndDetailsDataOutput(
                beaconMalfunction =
                    BeaconMalfunctionDataOutput.fromBeaconMalfunction(
                        beaconMalfunctionResumeAndDetails.beaconMalfunction,
                    ),
                resume =
                    beaconMalfunctionResumeAndDetails.resume?.let {
                        VesselBeaconMalfunctionResumeDataOutput.fromVesselBeaconMalfunctionResume(
                            beaconMalfunctionResumeAndDetails.resume,
                        )
                    },
                comments =
                    beaconMalfunctionResumeAndDetails.comments.map {
                        BeaconMalfunctionCommentDataOutput.fromBeaconMalfunctionComment(
                            it,
                        )
                    },
                actions =
                    beaconMalfunctionResumeAndDetails.actions.map {
                        BeaconMalfunctionActionDataOutput.fromBeaconMalfunctionAction(
                            it,
                        )
                    },
                notifications =
                    beaconMalfunctionResumeAndDetails.notifications.map {
                        BeaconMalfunctionNotificationsDataOutput.fromBeaconMalfunctionNotifications(
                            it,
                        )
                    },
            )
        }
    }
}
