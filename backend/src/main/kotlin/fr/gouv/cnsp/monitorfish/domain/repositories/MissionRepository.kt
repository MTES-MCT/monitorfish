package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.mission.Mission
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Deferred
import java.time.ZonedDateTime

interface MissionRepository {
    fun findControlUnitsOfMission(scope: CoroutineScope, missionId: Int): Deferred<List<ControlUnit>>
    fun findAllMissions(
        pageNumber: Int?,
        pageSize: Int?,
        startedAfterDateTime: ZonedDateTime?,
        startedBeforeDateTime: ZonedDateTime?,
        missionSources: List<String>?,
        missionTypes: List<String>?,
        missionStatuses: List<String>?,
        seaFronts: List<String>?,
    ): List<Mission>
}
