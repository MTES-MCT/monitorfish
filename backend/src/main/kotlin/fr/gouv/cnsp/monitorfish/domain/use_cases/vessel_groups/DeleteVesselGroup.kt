package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class DeleteVesselGroup(
    private val vesselGroupRepository: VesselGroupRepository,
) {
    private val logger: Logger = LoggerFactory.getLogger(DeleteVesselGroup::class.java)

    fun execute(
        userEmail: String,
        id: Int,
    ) {
        val vesselGroup = vesselGroupRepository.findById(id)

        if (vesselGroup.createdBy != userEmail) {
            throw BackendUsageException(BackendUsageErrorCode.UNAUTHORIZED)
        }

        logger.info("Deleting vessel group id $id by $userEmail.")
        return vesselGroupRepository.delete(id)
    }
}
