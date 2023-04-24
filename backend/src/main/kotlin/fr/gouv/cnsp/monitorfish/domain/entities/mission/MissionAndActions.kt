package fr.gouv.cnsp.monitorfish.domain.entities.mission

import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionAction

data class MissionAndActions (
    val mission: Mission,
    val actions: List<MissionAction>
)
