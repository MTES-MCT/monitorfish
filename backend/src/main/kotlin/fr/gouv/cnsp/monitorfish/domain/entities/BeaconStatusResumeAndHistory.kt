package fr.gouv.cnsp.monitorfish.domain.entities

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusWithDetails

data class BeaconStatusResumeAndHistory(
        val current: BeaconStatusWithDetails? = null,
        val history: List<BeaconStatusWithDetails>)
