package fr.gouv.cnsp.monitorfish.domain.entities

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusWithDetails

data class BeaconStatusResumeAndHistory(
        val history: List<BeaconStatusWithDetails>)
