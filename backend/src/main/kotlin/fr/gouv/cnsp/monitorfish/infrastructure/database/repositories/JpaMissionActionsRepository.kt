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
    ): List<MissionAction> =
        dbMissionActionsRepository
            .findAllByVesselIdEqualsAndActionDatetimeUtcAfterAndIsDeletedIsFalse(
                vesselId,
                afterDateTime.toInstant(),
            ).map { control -> control.toMissionAction(mapper) }

    override fun findByMissionId(missionId: Int): List<MissionAction> =
        dbMissionActionsRepository.findAllByMissionIdAndIsDeletedIsFalse(missionId).map { action ->
            action.toMissionAction(
                mapper,
            )
        }

    override fun findMissionActionsIn(missionIds: List<Int>): List<MissionAction> =
        dbMissionActionsRepository.findAllByMissionIdInAndIsDeletedIsFalse(missionIds).map { action ->
            action.toMissionAction(
                mapper,
            )
        }

    override fun save(missionAction: MissionAction): MissionAction =
        dbMissionActionsRepository
            .save(MissionActionEntity.fromMissionAction(mapper, missionAction))
            .toMissionAction(mapper)

    override fun findById(id: Int): MissionAction =
        dbMissionActionsRepository.findById(id).get().toMissionAction(mapper)

    override fun findSeaLandAndAirControlBetweenDates(
        beforeDateTime: ZonedDateTime,
        afterDateTime: ZonedDateTime,
    ): List<MissionAction> =
        dbMissionActionsRepository
            .findAllByActionDatetimeUtcBeforeAndActionDatetimeUtcAfterAndIsDeletedIsFalseAndActionTypeIn(
                beforeDateTime.toInstant(),
                afterDateTime.toInstant(),
                listOf(
                    MissionActionType.SEA_CONTROL,
                    MissionActionType.LAND_CONTROL,
                    MissionActionType.AIR_CONTROL,
                ),
            ).map { action ->
                action.toMissionAction(
                    mapper,
                )
            }
}
