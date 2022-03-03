package fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses

data class VesselBeaconMalfunctionsResumeAndHistory(
        val resume: VesselBeaconMalfunctionsResume,
        val current: BeaconStatusWithDetails? = null,
        val history: List<BeaconStatusWithDetails>)
