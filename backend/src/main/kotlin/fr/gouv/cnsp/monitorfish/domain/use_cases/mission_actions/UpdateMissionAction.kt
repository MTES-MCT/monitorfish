package fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository

@UseCase
class UpdateMissionAction(
    private val missionActionsRepository: MissionActionsRepository,
    private val getMissionActionFacade: GetMissionActionFacade,
) {
    fun execute(actionId: Int, action: MissionAction): MissionAction {
        action.verify()

        // We store the `storedValue` of the enum and not the enum uppercase value
        val facade = getMissionActionFacade.execute(action)?.toString()

        val actionWithId = action.copy(
            id = actionId,
            facade = facade,
        )

        return missionActionsRepository.save(actionWithId)
    }
}
