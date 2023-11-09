package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.MissionActionEntity
import org.springframework.data.repository.CrudRepository
import java.time.Instant

interface DBMissionActionsRepository : CrudRepository<MissionActionEntity, Int> {
    fun findAllByVesselIdEqualsAndActionDatetimeUtcAfterAndIsDeletedIsFalse(
        vesselId: Int,
        afterDateTime: Instant,
    ): List<MissionActionEntity>
    fun findAllByActionDatetimeUtcBeforeAndActionDatetimeUtcAfterAndIsDeletedIsFalseAndActionTypeIn(
        beforeDateTime: Instant,
        afterDateTime: Instant,
        actionTypes: List<MissionActionType>,
    ): List<MissionActionEntity>
    fun findAllByMissionIdAndIsDeletedIsFalse(missionId: Int): List<MissionActionEntity>
    fun findAllByMissionIdInAndIsDeletedIsFalse(missionIds: List<Int>): List<MissionActionEntity>
}
