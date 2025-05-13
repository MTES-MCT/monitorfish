package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ActiveVesselType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ActiveVesselWithReferentialData
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetActiveVessels(
    private val lastPositionRepository: LastPositionRepository,
    private val vesselGroupRepository: VesselGroupRepository,
) {
    private val logger: Logger = LoggerFactory.getLogger(GetActiveVessels::class.java)

    fun execute(userEmail: String): List<ActiveVesselWithReferentialData> {
        val now = ZonedDateTime.now()
        val lastPositionsWithProfileAndVessel = lastPositionRepository.findActiveVesselWithReferentialData()
        val vesselGroups = vesselGroupRepository.findAllByUser(userEmail)

        return lastPositionsWithProfileAndVessel
            .filter { it.hasLastPositionOrVesselProfileWithVessel() }
            .map { activeVessel ->
                val foundVesselGroups =
                    vesselGroups.filter { vesselGroup ->
                        when (vesselGroup) {
                            is DynamicVesselGroup -> vesselGroup.containsActiveVessel(activeVessel, now)
                            is FixedVesselGroup -> vesselGroup.containsActiveVessel(activeVessel)
                        }
                    }

                ActiveVesselWithReferentialData(
                    lastPosition = activeVessel.lastPosition,
                    vesselProfile = activeVessel.vesselProfile,
                    vessel = activeVessel.vessel,
                    producerOrganizationName = activeVessel.producerOrganizationName,
                    vesselGroups = foundVesselGroups,
                    activeVesselType =
                        activeVessel.lastPosition?.let { ActiveVesselType.POSITION_ACTIVITY }
                            ?: ActiveVesselType.LOGBOOK_ACTIVITY,
                    riskFactor = activeVessel.riskFactor,
                )
            }
    }
}
