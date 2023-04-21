package fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotDeleteException
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository

@UseCase
class DeleteMissionAction(private val missionActionsRepository: MissionActionsRepository) {
    @Throws(CouldNotDeleteException::class)
    fun execute(actionId: Int) {
        try {
            val targettedAction = missionActionsRepository.findById(actionId)
            val sofDeletedAction = targettedAction.copy(isDeleted = true)
            sofDeletedAction.isDeleted = true

            missionActionsRepository.save(sofDeletedAction)
        } catch (e: Throwable) {
            throw CouldNotDeleteException("Could not find mission action with id: ${e.message}")
        }
    }
}
