package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import org.slf4j.LoggerFactory

@UseCase
class EnrichMissionAction(
    private val portRepository: PortRepository,
) {
    private val logger = LoggerFactory.getLogger(EnrichMissionAction::class.java)

    /**
     * Add additional information to a MissionAction
     */
    fun execute(action: MissionAction): MissionAction {
        val portName: String? =
            action.portLocode?.let { locode ->
                try {
                    portRepository.findByLocode(locode = locode).name
                } catch (e: CodeNotFoundException) {
                    logger.warn(e.message)
                    null
                }
            }
        return action.copy(portName = portName)
    }
}
