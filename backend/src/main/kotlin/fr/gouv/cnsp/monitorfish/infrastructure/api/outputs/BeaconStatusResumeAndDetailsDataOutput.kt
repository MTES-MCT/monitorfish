package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusResumeAndDetails

data class BeaconStatusResumeAndDetailsDataOutput(
        val beaconStatus: BeaconStatusDataOutput,
        val resume: VesselBeaconStatusResumeDataOutput? = null,
        val comments: List<BeaconStatusCommentDataOutput>,
        val actions: List<BeaconStatusActionDataOutput>) {
    companion object {
        fun fromBeaconStatusResumeAndDetails(beaconStatusResumeAndDetails: BeaconStatusResumeAndDetails): BeaconStatusResumeAndDetailsDataOutput {
            return BeaconStatusResumeAndDetailsDataOutput(
                    beaconStatus = BeaconStatusDataOutput.fromBeaconStatus(beaconStatusResumeAndDetails.beaconStatus),
                    resume = beaconStatusResumeAndDetails.resume?.let {
                        VesselBeaconStatusResumeDataOutput.fromVesselBeaconStatusResume(beaconStatusResumeAndDetails.resume)
                    },
                    comments = beaconStatusResumeAndDetails.comments.map { BeaconStatusCommentDataOutput.fromBeaconStatusComment(it) },
                    actions = beaconStatusResumeAndDetails.actions.map { BeaconStatusActionDataOutput.fromBeaconStatusAction(it) }
            )
        }
    }
}
