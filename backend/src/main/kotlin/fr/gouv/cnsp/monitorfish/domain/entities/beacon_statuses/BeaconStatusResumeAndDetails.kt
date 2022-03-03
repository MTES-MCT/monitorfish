package fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses

data class BeaconStatusResumeAndDetails(
        val beaconStatus: BeaconStatus,
        val resume: VesselBeaconMalfunctionsResume? = null,
        val comments: List<BeaconStatusComment>,
        val actions: List<BeaconStatusAction>)
