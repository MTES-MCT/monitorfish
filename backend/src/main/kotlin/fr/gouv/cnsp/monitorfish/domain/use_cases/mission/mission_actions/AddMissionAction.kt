package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository

@UseCase
class AddMissionAction(
    private val missionActionsRepository: MissionActionsRepository,
    private val getMissionActionFacade: GetMissionActionFacade,
) {
    fun execute(action: MissionAction): MissionAction {
        require(action.id == null) {
            "An action creation must have no id: the `id` must be null."
        }

        action.verify()

        // We store the `storedValue` of the enum and not the enum uppercase value
        val facade = getMissionActionFacade.execute(action)?.toString()

        val actionWithFacade = action.copy(facade = facade)

        return missionActionsRepository.save(actionWithFacade)
    }
}
