package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.MissionActionEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBMissionActionsRepository
import org.springframework.stereotype.Repository
import java.time.ZonedDateTime

@Repository
class JpaMissionActionsRepository(
    private val dbMissionActionsRepository: DBMissionActionsRepository,
    private val mapper: ObjectMapper,
) : MissionActionsRepository {

    override fun findVesselMissionActionsAfterDateTime(
        vesselId: Int,
        afterDateTime: ZonedDateTime,
    ): List<fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction> {
        return dbMissionActionsRepository.findAllByVesselIdEqualsAndActionDatetimeUtcAfterAndIsDeletedIsFalse(
            vesselId,
            afterDateTime.toInstant(),
        ).map { control -> control.toMissionAction(mapper) }
    }

    override fun findByMissionId(missionId: Int): List<fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction> {
        return dbMissionActionsRepository.findAllByMissionIdAndIsDeletedIsFalse(missionId).map { action ->
            action.toMissionAction(
                mapper,
            )
        }
    }

    override fun findMissionActionsIn(missionIds: List<Int>): List<fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction> {
        return dbMissionActionsRepository.findAllByMissionIdInAndIsDeletedIsFalse(missionIds).map { action ->
            action.toMissionAction(
                mapper,
            )
        }
    }

    override fun save(missionAction: fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction): fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction {
        return dbMissionActionsRepository.save(MissionActionEntity.fromMissionAction(mapper, missionAction))
            .toMissionAction(mapper)
    }

    override fun findById(id: Int): fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction {
        return dbMissionActionsRepository.findById(id).get().toMissionAction(mapper)
    }

    override fun findControlsInDates(beforeDateTime: ZonedDateTime, afterDateTime: ZonedDateTime): List<fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction> {
        return dbMissionActionsRepository.findAllByActionDatetimeUtcBeforeAndActionDatetimeUtcAfterAndIsDeletedIsFalseAndActionTypeIn(
            beforeDateTime.toInstant(),
            afterDateTime.toInstant(),
            listOf(
                MissionActionType.SEA_CONTROL,
                MissionActionType.LAND_CONTROL,
            ),
        ).map { action ->
            action.toMissionAction(
                mapper,
            )
        }
    }
}
