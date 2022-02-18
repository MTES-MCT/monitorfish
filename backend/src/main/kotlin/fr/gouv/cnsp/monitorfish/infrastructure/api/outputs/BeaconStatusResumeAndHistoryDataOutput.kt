package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.VesselBeaconStatusResumeAndHistory

data class BeaconStatusResumeAndHistoryDataOutput(
        val resume: VesselBeaconStatusResumeDataOutput,
        val current: BeaconStatusWithDetailsDataOutput?,
        val history: List<BeaconStatusWithDetailsDataOutput>) {
    companion object {
        fun fromBeaconStatusResumeAndHistory(vesselBeaconStatusResumeAndHistory: VesselBeaconStatusResumeAndHistory) = BeaconStatusResumeAndHistoryDataOutput(
                resume = VesselBeaconStatusResumeDataOutput.fromVesselBeaconStatusResume(vesselBeaconStatusResumeAndHistory.resume),
                current = vesselBeaconStatusResumeAndHistory.current?.let {
                    BeaconStatusWithDetailsDataOutput.fromBeaconStatusWithDetails(vesselBeaconStatusResumeAndHistory.current)
                },
                history = vesselBeaconStatusResumeAndHistory.history.map { BeaconStatusWithDetailsDataOutput.fromBeaconStatusWithDetails(it) }
        )
    }
}
