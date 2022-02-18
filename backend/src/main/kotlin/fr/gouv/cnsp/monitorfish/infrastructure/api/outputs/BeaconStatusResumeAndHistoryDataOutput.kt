package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.BeaconStatusResumeAndHistory

data class BeaconStatusResumeAndHistoryDataOutput(
        val current: BeaconStatusWithDetailsDataOutput?,
        val history: List<BeaconStatusWithDetailsDataOutput>) {
    companion object {
        fun fromBeaconStatusResumeAndHistory(beaconStatusResumeAndHistory: BeaconStatusResumeAndHistory) = BeaconStatusResumeAndHistoryDataOutput(
                current = beaconStatusResumeAndHistory.current?.let {
                    BeaconStatusWithDetailsDataOutput.fromBeaconStatusWithDetails(beaconStatusResumeAndHistory.current)
                },
                history = beaconStatusResumeAndHistory.history.map { BeaconStatusWithDetailsDataOutput.fromBeaconStatusWithDetails(it) }
        )
    }
}
