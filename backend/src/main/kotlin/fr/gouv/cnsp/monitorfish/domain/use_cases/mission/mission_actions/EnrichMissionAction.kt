package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import org.slf4j.LoggerFactory

@UseCase
class EnrichMissionAction(
    private val portRepository: PortRepository,
    private val infractionRepository: InfractionRepository,
) {
    private val logger = LoggerFactory.getLogger(EnrichMissionAction::class.java)

    /**
     * Add additional information to a MissionAction
     */
    fun execute(action: MissionAction): MissionAction {
        val allInfractions = infractionRepository.findAll()

        val portName: String? =
            action.portLocode?.let { locode ->
                try {
                    portRepository.findByLocode(locode = locode).name
                } catch (e: CodeNotFoundException) {
                    logger.warn(e.message)
                    null
                }
            }

        val infractions =
            action.infractions.map { infraction ->
                val natinfDescription = allInfractions.firstOrNull { it.natinfCode == infraction.natinf }?.infraction

                infraction.copy(natinfDescription = natinfDescription)
            }

        return action.copy(portName = portName, infractions = infractions)
    }
}
