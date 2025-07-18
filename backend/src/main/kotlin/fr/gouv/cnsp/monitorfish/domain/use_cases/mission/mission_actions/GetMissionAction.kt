package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotFindException
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import org.slf4j.LoggerFactory

@UseCase
class GetMissionAction(
    private val missionActionsRepository: MissionActionsRepository,
    private val enrichMissionAction: EnrichMissionAction,
) {
    private val logger = LoggerFactory.getLogger(GetMissionAction::class.java)

    @Throws(CouldNotFindException::class)
    fun execute(actionId: Int): MissionAction {
        try {
            var action = missionActionsRepository.findById(actionId)
            return enrichMissionAction.execute(action = action)
        } catch (e: Throwable) {
            throw CouldNotFindException("Could not find mission action with id: ${e.message}", e)
        }
    }
}
