package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetAuthorizedUser
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.dtos.CreateOrUpdateFixedVesselGroupCommand
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.ZoneOffset
import java.time.ZonedDateTime

@UseCase
class AddOrUpdateFixedVesselGroup(
    private val vesselGroupRepository: VesselGroupRepository,
    private val getAuthorizedUser: GetAuthorizedUser,
) {
    private val logger: Logger = LoggerFactory.getLogger(AddOrUpdateFixedVesselGroup::class.java)

    fun execute(
        userEmail: String,
        vesselGroupCreation: CreateOrUpdateFixedVesselGroupCommand,
    ): FixedVesselGroup {
        logger.info(
            "Adding or updating vessel group ${vesselGroupCreation.id ?: vesselGroupCreation.name} from user $userEmail.",
        )
        val userService = getAuthorizedUser.execute(userEmail).service

        return when (vesselGroupCreation.id) {
            null -> {
                val vesselGroup =
                    vesselGroupCreation.toFixedVesselGroup(
                        createdBy = userEmail,
                        createdAtUtc = ZonedDateTime.now(ZoneOffset.UTC),
                        updatedAtUtc = null,
                    )

                vesselGroupRepository.upsert(vesselGroup)
            }
            else -> {
                val vesselGroup =
                    when (val savedVesselGroup = vesselGroupRepository.findById(vesselGroupCreation.id)) {
                        is DynamicVesselGroup -> throw BackendUsageException(
                            BackendUsageErrorCode.COULD_NOT_UPDATE,
                            message = "Could not update a dynamic group to a fixed group.",
                        )
                        is FixedVesselGroup -> {
                            val hasRight = savedVesselGroup.hasUserRights(userEmail, userService)
                            if (!hasRight) {
                                throw BackendUsageException(
                                    BackendUsageErrorCode.COULD_NOT_UPDATE,
                                    message = "Your are not allowed to update this fixed group.",
                                )
                            }

                            vesselGroupCreation.toFixedVesselGroup(
                                createdBy = savedVesselGroup.createdBy,
                                createdAtUtc = savedVesselGroup.createdAtUtc,
                                updatedAtUtc = ZonedDateTime.now(),
                            )
                        }
                    }

                vesselGroupRepository.upsert(vesselGroup)
            }
        }
    }
}
