package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.control_units.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.mission.Mission
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotFindException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Deferred
import java.time.ZonedDateTime

interface MissionRepository {
    fun findControlUnitsOfMission(
        scope: CoroutineScope,
        missionId: Int,
    ): Deferred<List<LegacyControlUnit>>

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

    fun findByIds(ids: List<Int>): List<Mission>

    @Throws(CouldNotFindException::class)
    fun findById(id: Int): Mission
}
