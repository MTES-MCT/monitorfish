package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlUnit
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Deferred

interface MissionRepository {
    fun findControlUnitsOfMission(scope: CoroutineScope, missionId: Int): Deferred<List<ControlUnit>>
}
