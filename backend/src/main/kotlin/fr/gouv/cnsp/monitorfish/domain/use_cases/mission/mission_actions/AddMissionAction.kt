package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.SpeciesControl
import fr.gouv.cnsp.monitorfish.domain.entities.species.Species
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.species.GetSpeciesFromCode

@UseCase
class AddMissionAction(
    private val missionActionsRepository: MissionActionsRepository,
    private val getMissionActionFacade: GetMissionActionFacade,
    private val getSpeciesFromCode: GetSpeciesFromCode,
) {
    fun execute(action: MissionAction): MissionAction {
        require(action.id == null) {
            "An action creation must have no id: the `id` must be null."
        }

        action.verify()

        // We store the `storedValue` of the enum and not the enum uppercase value
        val facade = getMissionActionFacade.execute(action)?.toString()

        val speciesOnboard: List<SpeciesControl> =
            action.speciesOnboard.map {
                val singleSpecies: Species? = getSpeciesFromCode.execute(code = it.speciesCode)
                it.apply { this.speciesName = singleSpecies?.name }
            }

        val enrichedAction = action.copy(facade = facade, speciesOnboard = speciesOnboard)

        return missionActionsRepository.save(enrichedAction)
    }
}
