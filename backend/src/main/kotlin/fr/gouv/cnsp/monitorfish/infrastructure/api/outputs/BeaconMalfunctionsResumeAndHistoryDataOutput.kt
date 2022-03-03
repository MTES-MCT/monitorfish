package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.VesselBeaconMalfunctionsResumeAndHistory

data class BeaconMalfunctionsResumeAndHistoryDataOutput(
        val resume: VesselBeaconStatusResumeDataOutput,
        val current: BeaconStatusWithDetailsDataOutput?,
        val history: List<BeaconStatusWithDetailsDataOutput>) {
    companion object {
        fun fromBeaconMalfunctionsResumeAndHistory(vesselBeaconMalfunctionsResumeAndHistory: VesselBeaconMalfunctionsResumeAndHistory) = BeaconMalfunctionsResumeAndHistoryDataOutput(
                resume = VesselBeaconStatusResumeDataOutput.fromVesselBeaconStatusResume(vesselBeaconMalfunctionsResumeAndHistory.resume),
                current = vesselBeaconMalfunctionsResumeAndHistory.current?.let {
                    BeaconStatusWithDetailsDataOutput.fromBeaconStatusWithDetails(vesselBeaconMalfunctionsResumeAndHistory.current)
                },
                history = vesselBeaconMalfunctionsResumeAndHistory.history.map { BeaconStatusWithDetailsDataOutput.fromBeaconStatusWithDetails(it) }
        )
    }
}
