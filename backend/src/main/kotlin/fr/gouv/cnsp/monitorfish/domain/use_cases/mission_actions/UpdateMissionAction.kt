package fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository

@UseCase
class UpdateMissionAction(
    private val missionActionsRepository: MissionActionsRepository,
    private val getMissionActionFacade: GetMissionActionFacade,
) {
    fun execute(actionId: Int, action: MissionAction): MissionAction {
        val controlRequiringVesselId = listOf(
            MissionActionType.AIR_CONTROL,
            MissionActionType.LAND_CONTROL,
            MissionActionType.SEA_CONTROL,
        )
        if (controlRequiringVesselId.any { it == action.actionType }) {
            require(action.vesselId != null) {
                "A control must specify a vessel: the `vesselId` must be given."
            }
        }

        // We store the `storedValue` of the enum and not the enum uppercase value
        val facade = getMissionActionFacade.execute(action)?.toString()

        val actionWithId = action.copy(
            id = actionId,
            facade = facade,
        )

        return missionActionsRepository.save(actionWithId)
    }
}
