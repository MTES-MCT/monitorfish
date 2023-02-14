package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlUnit
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Deferred

interface ControlUnitRepository {
    fun findAll(scope: CoroutineScope): Deferred<List<ControlUnit>>
}
