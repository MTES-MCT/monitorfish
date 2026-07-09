package fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions

import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.GroupType

/**
 * Snapshot of a shared group the vessel belonged to at the moment of control.
 */
data class MissionActionVesselGroup(
    val id: Int? = null,
    val name: String,
    val color: String,
    val type: GroupType,
    val isPriorityGroup: Boolean = false,
)
