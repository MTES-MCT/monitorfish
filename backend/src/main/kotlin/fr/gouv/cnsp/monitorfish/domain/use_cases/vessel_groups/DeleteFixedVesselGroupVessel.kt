package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class DeleteFixedVesselGroupVessel(
    private val vesselGroupRepository: VesselGroupRepository,
) {
    private val logger: Logger = LoggerFactory.getLogger(DeleteFixedVesselGroupVessel::class.java)

    fun execute(
        userEmail: String,
        groupId: Int,
        vesselIndex: Int,
    ): FixedVesselGroup {
        logger.info(
            "Updating vessel group $groupId from user $userEmail.",
        )

        val updatedVesselGroup =
            when (val savedVesselGroup = vesselGroupRepository.findById(groupId)) {
                is DynamicVesselGroup -> throw BackendUsageException(
                    BackendUsageErrorCode.COULD_NOT_UPDATE,
                    message = "Could not update a dynamic group to a fixed group.",
                )
                is FixedVesselGroup -> {
                    if (savedVesselGroup.createdBy != userEmail) {
                        throw BackendUsageException(
                            BackendUsageErrorCode.COULD_NOT_UPDATE,
                            message = "Your are not allowed to update this fixed group.",
                        )
                    }

                    try {
                        val mutableList = savedVesselGroup.vessels.toMutableList()

                        mutableList.removeAt(vesselIndex)

                        savedVesselGroup.copy(vessels = mutableList.toList())
                    } catch (e: Throwable) {
                        throw BackendUsageException(
                            BackendUsageErrorCode.COULD_NOT_UPDATE,
                            message = "Incorrect vessel index",
                            cause = e,
                        )
                    }
                }
            }

        return vesselGroupRepository.save(updatedVesselGroup)
    }
}
