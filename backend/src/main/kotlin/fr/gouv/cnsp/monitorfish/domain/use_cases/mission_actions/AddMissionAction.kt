package fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository

@UseCase
class AddMissionAction(private val missionActionsRepository: MissionActionsRepository) {
    fun execute(action: MissionAction): MissionAction {
        return missionActionsRepository.save(action)
    }
}
