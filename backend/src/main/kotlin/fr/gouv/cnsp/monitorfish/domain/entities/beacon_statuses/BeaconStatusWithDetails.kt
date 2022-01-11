package fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses

data class BeaconStatusWithDetails(
        val beaconStatus: BeaconStatus,
        val comments: List<BeaconStatusComment>)
