package fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses

data class VesselBeaconStatusResumeAndHistory(
        val resume: VesselBeaconStatusResume,
        val current: BeaconStatusWithDetails? = null,
        val history: List<BeaconStatusWithDetails>)
