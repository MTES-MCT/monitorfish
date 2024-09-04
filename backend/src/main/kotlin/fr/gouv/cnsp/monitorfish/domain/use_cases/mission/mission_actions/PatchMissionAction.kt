package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.PatchableMissionAction
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.mappers.PatchEntity
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository

@UseCase
class PatchMissionAction(
    private val missionActionsRepository: MissionActionsRepository,
    private val patchMissionAction: PatchEntity<MissionAction, PatchableMissionAction>,
) {
    fun execute(
        id: Int,
        patchableEnvActionEntity: PatchableMissionAction,
    ): MissionAction {
        return try {
            val previousMissionAction = missionActionsRepository.findById(id)

            val updatedMissionAction = patchMissionAction.execute(previousMissionAction, patchableEnvActionEntity)

            missionActionsRepository.save(updatedMissionAction)
        } catch (e: Exception) {
            throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND, "Action $id not found", e)
        }
    }
}
