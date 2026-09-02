package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import org.slf4j.LoggerFactory

@UseCase
class UpdateMissionActionSpeciesOnboard(
    private val missionActionsRepository: MissionActionsRepository,
) {
    private val logger = LoggerFactory.getLogger(UpdateMissionActionSpeciesOnboard::class.java)

    fun execute(
        id: Int,
        speciesIndex: Int,
        toleranceMargin: Double?,
    ): MissionAction {
        val previousMissionAction =
            try {
                logger.info("Updating species $speciesIndex of mission action $id")

                missionActionsRepository.findById(id)
            } catch (e: Exception) {
                throw BackendUsageException(
                    BackendUsageErrorCode.NOT_FOUND,
                    message = "Action $id not found",
                    cause = e,
                )
            }

        val speciesOnboard =
            previousMissionAction.speciesOnboard.getOrNull(speciesIndex)
                ?: throw BackendUsageException(
                    BackendUsageErrorCode.NOT_FOUND,
                    message = "Species index $speciesIndex not found in action $id",
                )

        return try {
            speciesOnboard.toleranceMargin = toleranceMargin

            missionActionsRepository.save(previousMissionAction)
        } catch (e: Exception) {
            throw BackendUsageException(
                BackendUsageErrorCode.COULD_NOT_UPDATE,
                message = e.message,
                cause = e,
            )
        }
    }
}
