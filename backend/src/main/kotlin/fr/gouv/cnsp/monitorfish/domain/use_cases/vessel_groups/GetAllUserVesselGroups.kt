package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.PriorityVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupBase
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetAuthorizedUser
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class GetAllUserVesselGroups(
    private val vesselGroupRepository: VesselGroupRepository,
    private val getAuthorizedUser: GetAuthorizedUser,
) {
    private val logger: Logger = LoggerFactory.getLogger(GetAllUserVesselGroups::class.java)

    fun execute(userEmail: String): List<VesselGroupBase> {
        val authorizedUser = getAuthorizedUser.execute(userEmail)

        val userGroups =
            vesselGroupRepository.findAllByUserAndSharing(
                user = userEmail,
                service = authorizedUser.service,
            )

        return if (authorizedUser.isSuperUser) {
            PriorityVesselGroup.PRIORITY_GROUPS + userGroups
        } else {
            userGroups
        }
    }
}
