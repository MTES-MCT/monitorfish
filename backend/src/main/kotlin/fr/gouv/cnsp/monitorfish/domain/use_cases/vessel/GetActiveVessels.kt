package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetAuthorizedUser
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetActiveVessels(
    private val lastPositionRepository: LastPositionRepository,
    private val vesselGroupRepository: VesselGroupRepository,
    private val getAuthorizedUser: GetAuthorizedUser,
) {
    private val logger: Logger = LoggerFactory.getLogger(GetActiveVessels::class.java)

    fun execute(userEmail: String): List<EnrichedActiveVessel> {
        val now = ZonedDateTime.now()
        val userService = getAuthorizedUser.execute(userEmail).service

        val lastPositionsWithProfileAndVessel = lastPositionRepository.findActiveVesselWithReferentialData()
        val vesselGroups =
            vesselGroupRepository.findAllByUserAndSharing(
                user = userEmail,
                service = userService,
            )

        return lastPositionsWithProfileAndVessel
            .map { activeVessel ->
                val foundVesselGroups =
                    vesselGroups.filter { vesselGroup ->
                        when (vesselGroup) {
                            is DynamicVesselGroup -> vesselGroup.containsActiveVessel(activeVessel, now)
                            is FixedVesselGroup -> vesselGroup.containsActiveVessel(activeVessel)
                        }
                    }

                EnrichedActiveVessel(
                    lastPosition = activeVessel.lastPosition,
                    vesselProfile = activeVessel.vesselProfile,
                    vessel = activeVessel.vessel,
                    producerOrganization = activeVessel.producerOrganization,
                    vesselGroups = foundVesselGroups,
                    riskFactor = activeVessel.riskFactor,
                )
            }
    }
}
