package fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository

@UseCase
class AddMissionAction(
    private val missionActionsRepository: MissionActionsRepository,
    private val portsRepository: PortRepository
) {
    fun execute(action: MissionAction): MissionAction {
        require(action.id == null) {
            "An action creation must have no id: the `id` must be null."
        }

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

        val facade = when (action.actionType) {
            MissionActionType.SEA_CONTROL -> {
                if (action.latitude != null && action.longitude != null) {
                    null
                }

                null
            }
            MissionActionType.LAND_CONTROL -> {
                if (action.portLocode != null) {
                    portsRepository.find(action.portLocode).facade
                }

                null
            }
            MissionActionType.AIR_CONTROL -> TODO()
            MissionActionType.AIR_SURVEILLANCE -> TODO()
            MissionActionType.OBSERVATION -> TODO()
        }

        val actionWithFacade = action.copy(facade = facade)

        return missionActionsRepository.save(actionWithFacade)
    }
}
