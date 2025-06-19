package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.PatchableMissionAction
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.mappers.PatchEntity
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import org.slf4j.LoggerFactory

@UseCase
class PatchMissionAction(
    private val missionActionsRepository: MissionActionsRepository,
    private val patchMissionAction: PatchEntity<MissionAction, PatchableMissionAction>,
) {
    private val logger = LoggerFactory.getLogger(GetVesselControls::class.java)

    fun execute(
        id: Int,
        patchableEnvActionEntity: PatchableMissionAction,
    ): MissionAction {
        val previousMissionAction =
            try {
                logger.info("Patching mission action $id")

                missionActionsRepository.findById(id)
            } catch (e: Exception) {
                throw BackendUsageException(
                    BackendUsageErrorCode.NOT_FOUND,
                    message = "Action $id not found",
                    cause = e,
                )
            }

        return try {
            val updatedMissionAction = patchMissionAction.execute(previousMissionAction, patchableEnvActionEntity)

            missionActionsRepository.save(updatedMissionAction)
        } catch (e: Exception) {
            throw BackendUsageException(
                BackendUsageErrorCode.COULD_NOT_UPDATE,
                message = e.message,
                cause = e,
            )
        }
    }
}
