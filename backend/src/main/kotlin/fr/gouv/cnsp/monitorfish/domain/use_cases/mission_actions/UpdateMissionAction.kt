package fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository

@UseCase
class UpdateMissionAction(private val missionActionsRepository: MissionActionsRepository) {
    fun execute(actionId: Int, action: MissionAction): MissionAction {
        val controlRequiringVesselId = listOf(
            MissionActionType.AIR_CONTROL,
            MissionActionType.LAND_CONTROL,
            MissionActionType.LAND_CONTROL,
        )
        require(controlRequiringVesselId.any { it == action.actionType && action.vesselId != null }) {
            "A control must specify a vessel: the `vesselId` must be given."
        }

        val actionWithId = action.copy(id = actionId)

        return missionActionsRepository.save(actionWithId)
    }
}
