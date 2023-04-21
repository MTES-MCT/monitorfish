package fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import org.slf4j.LoggerFactory

@UseCase
class GetMissionActions(
    private val missionActionsRepository: MissionActionsRepository,
) {
    private val logger = LoggerFactory.getLogger(GetMissionActions::class.java)

    fun execute(missionId: Int): List<MissionAction> {
        logger.debug("Searching actions for mission $missionId")
        val actions = missionActionsRepository.findMissionActions(missionId)
        logger.debug("Found ${actions.size} actions for mission $missionId")

        return actions
    }
}
