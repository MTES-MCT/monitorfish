package fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository

@UseCase
class UpdateMissionAction(private val missionActionsRepository: MissionActionsRepository) {
    fun execute(actionId: Int, action: MissionAction): MissionAction {
        val actionWithId = action.copy(id = actionId)

        return missionActionsRepository.save(actionWithId)
    }
}
