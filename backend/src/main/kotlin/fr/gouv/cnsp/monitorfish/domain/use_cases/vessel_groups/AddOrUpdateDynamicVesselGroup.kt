package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetAuthorizedUser
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.dtos.CreateOrUpdateDynamicVesselGroupCommand
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.ZoneOffset
import java.time.ZonedDateTime

@UseCase
class AddOrUpdateDynamicVesselGroup(
    private val vesselGroupRepository: VesselGroupRepository,
    private val getAuthorizedUser: GetAuthorizedUser,
) {
    private val logger: Logger = LoggerFactory.getLogger(AddOrUpdateDynamicVesselGroup::class.java)

    fun execute(
        userEmail: String,
        vesselGroupCreation: CreateOrUpdateDynamicVesselGroupCommand,
    ): DynamicVesselGroup {
        logger.info(
            "Adding or updating vessel group ${vesselGroupCreation.id ?: vesselGroupCreation.name} from user $userEmail.",
        )
        val userService = getAuthorizedUser.execute(userEmail).service

        return when (vesselGroupCreation.id) {
            null -> {
                val vesselGroup =
                    vesselGroupCreation.toDynamicVesselGroup(
                        createdBy = userEmail,
                        createdAtUtc = ZonedDateTime.now(ZoneOffset.UTC),
                        updatedAtUtc = null,
                    )

                vesselGroupRepository.upsert(vesselGroup)
            }
            else -> {
                val vesselGroup =
                    when (val savedVesselGroup = vesselGroupRepository.findById(vesselGroupCreation.id)) {
                        is DynamicVesselGroup -> {
                            val hasRight = savedVesselGroup.hasUserRights(userEmail, userService)
                            if (!hasRight) {
                                throw BackendUsageException(
                                    BackendUsageErrorCode.COULD_NOT_UPDATE,
                                    message = "Your are not allowed to update this dynamic group.",
                                )
                            }

                            vesselGroupCreation.toDynamicVesselGroup(
                                createdBy = savedVesselGroup.createdBy,
                                createdAtUtc = savedVesselGroup.createdAtUtc,
                                updatedAtUtc = ZonedDateTime.now(),
                            )
                        }
                        is FixedVesselGroup -> {
                            throw BackendUsageException(
                                BackendUsageErrorCode.COULD_NOT_UPDATE,
                                message = "Could not update a fixed group to a dynamic group.",
                            )
                        }
                    }

                vesselGroupRepository.upsert(vesselGroup)
            }
        }
    }
}
