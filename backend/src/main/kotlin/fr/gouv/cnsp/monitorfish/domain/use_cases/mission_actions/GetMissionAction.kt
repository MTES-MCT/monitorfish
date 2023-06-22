package fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotFindException
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository

@UseCase
class GetMissionAction(private val missionActionsRepository: MissionActionsRepository) {
    @Throws(CouldNotFindException::class)
    fun execute(actionId: Int): MissionAction {
        try {
            return missionActionsRepository.findById(actionId)
        } catch (e: Throwable) {
            throw CouldNotFindException("Could not find mission action with id: ${e.message}", e)
        }
    }
}
