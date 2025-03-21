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
class AddOrUpdateDynamicVesselGroup(
    private val vesselGroupRepository: VesselGroupRepository,
) {
    private val logger: Logger = LoggerFactory.getLogger(AddOrUpdateDynamicVesselGroup::class.java)

    fun execute(
        userEmail: String,
        vesselGroup: DynamicVesselGroup,
    ): DynamicVesselGroup {
        logger.info(
            "Adding or updating vessel group ${vesselGroup.id ?: vesselGroup.name} from user $userEmail.",
        )
        val vesselGroupWithEmail = vesselGroup.copy(createdBy = userEmail)

        return when (vesselGroup.id) {
            null -> {
                vesselGroupRepository.save(vesselGroupWithEmail)
            }
            else -> {
                when (val savedVesselGroup = vesselGroupRepository.findById(vesselGroup.id)) {
                    is DynamicVesselGroup -> {
                        if (savedVesselGroup.createdBy != userEmail) {
                            throw BackendUsageException(
                                BackendUsageErrorCode.COULD_NOT_UPDATE,
                                message = "Your are not allowed to update this dynamic group.",
                            )
                        }
                    }
                    is FixedVesselGroup -> throw BackendUsageException(
                        BackendUsageErrorCode.COULD_NOT_UPDATE,
                        message = "Could not update a fixed group to a dynamic group.",
                    )
                }

                vesselGroupRepository.save(vesselGroupWithEmail)
            }
        }
    }
}
