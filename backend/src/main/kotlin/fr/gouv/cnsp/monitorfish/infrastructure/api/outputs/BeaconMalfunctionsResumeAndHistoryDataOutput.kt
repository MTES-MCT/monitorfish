package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.VesselBeaconMalfunctionsResumeAndHistory

data class BeaconMalfunctionsResumeAndHistoryDataOutput(
    val resume: VesselBeaconMalfunctionResumeDataOutput,
    val current: BeaconMalfunctionWithDetailsDataOutput?,
    val history: List<BeaconMalfunctionWithDetailsDataOutput>,
) {
    companion object {
        fun fromBeaconMalfunctionsResumeAndHistory(
            vesselBeaconMalfunctionsResumeAndHistory: VesselBeaconMalfunctionsResumeAndHistory,
        ) = BeaconMalfunctionsResumeAndHistoryDataOutput(
            resume =
                VesselBeaconMalfunctionResumeDataOutput.fromVesselBeaconMalfunctionResume(
                    vesselBeaconMalfunctionsResumeAndHistory.resume,
                ),
            current =
                vesselBeaconMalfunctionsResumeAndHistory.current?.let {
                    BeaconMalfunctionWithDetailsDataOutput.fromBeaconMalfunctionWithDetails(
                        vesselBeaconMalfunctionsResumeAndHistory.current,
                    )
                },
            history =
                vesselBeaconMalfunctionsResumeAndHistory.history.map {
                    BeaconMalfunctionWithDetailsDataOutput.fromBeaconMalfunctionWithDetails(
                        it,
                    )
                },
        )
    }
}
