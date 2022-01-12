package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusWithDetails

data class BeaconStatusWithDetailsDataOutput(
        val beaconStatus: BeaconStatusDataOutput,
        val comments: List<BeaconStatusCommentDataOutput>,
        val actions: List<BeaconStatusActionDataOutput>) {
    companion object {
        fun fromBeaconStatusWithDetails(beaconStatusWithDetails: BeaconStatusWithDetails): BeaconStatusWithDetailsDataOutput {
            return BeaconStatusWithDetailsDataOutput(
                    beaconStatus = BeaconStatusDataOutput.fromBeaconStatus(beaconStatusWithDetails.beaconStatus),
                    comments = beaconStatusWithDetails.comments.map { BeaconStatusCommentDataOutput.fromBeaconStatusComment(it) },
                    actions = beaconStatusWithDetails.actions.map { BeaconStatusActionDataOutput.fromBeaconStatusAction(it) }
            )
        }
    }
}
