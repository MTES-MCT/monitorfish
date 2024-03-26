package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotDeleteException
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository

@UseCase
class DeleteMissionAction(private val missionActionsRepository: MissionActionsRepository) {
    @Throws(CouldNotDeleteException::class)
    fun execute(actionId: Int) {
        try {
            val targetedAction = missionActionsRepository.findById(actionId)
            val sofDeletedAction = targetedAction.copy(isDeleted = true)

            missionActionsRepository.save(sofDeletedAction)
        } catch (e: Throwable) {
            throw CouldNotDeleteException("Could not find mission action with id: ${e.message}", e)
        }
    }
}
