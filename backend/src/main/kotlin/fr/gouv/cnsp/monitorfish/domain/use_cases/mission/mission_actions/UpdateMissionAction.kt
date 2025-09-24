package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.SpeciesControl
import fr.gouv.cnsp.monitorfish.domain.entities.species.Species
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.species.GetSpeciesFromCode
import org.slf4j.LoggerFactory

@UseCase
class UpdateMissionAction(
    private val missionActionsRepository: MissionActionsRepository,
    private val getMissionActionFacade: GetMissionActionFacade,
    private val getSpeciesFromCode: GetSpeciesFromCode,
) {
    private val logger = LoggerFactory.getLogger(UpdateMissionAction::class.java)

    fun execute(
        actionId: Int,
        action: MissionAction,
    ): MissionAction {
        val previousMissionAction = missionActionsRepository.findById(actionId)

        logger.info("Updating mission action $actionId")
        action.verify()

        // We store the `storedValue` of the enum and not the enum uppercase value
        val facade = getMissionActionFacade.execute(action)?.toString()

        val speciesOnboard: List<SpeciesControl> =
            action.speciesOnboard.map {
                val singleSpecies: Species? = getSpeciesFromCode.execute(code = it.speciesCode)
                it.apply { this.speciesName = singleSpecies?.name }
            }

        val enrichedAction =
            action.copy(
                speciesOnboard = speciesOnboard,
                actionEndDatetimeUtc = previousMissionAction.actionEndDatetimeUtc,
                observationsByUnit = previousMissionAction.observationsByUnit,
                id = actionId,
                facade = facade,
            )

        return missionActionsRepository.save(enrichedAction)
    }
}
