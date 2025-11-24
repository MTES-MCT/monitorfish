package fr.gouv.cnsp.monitorfish.domain.entities.rapportnav

import kotlinx.serialization.Serializable

@Serializable
data class RapportNavMissionAction(
    val id: Int,
    val containsActionsAddedByUnit: Boolean,
)
