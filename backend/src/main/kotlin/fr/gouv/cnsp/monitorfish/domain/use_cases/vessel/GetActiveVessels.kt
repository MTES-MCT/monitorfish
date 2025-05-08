package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ActiveVesselType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ActiveVesselWithReferentialData
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupBase
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
            .filter {
                if (it.lastPosition == null && it.vesselProfile != null && it.vessel == null) {
                    logger.warn(
                        "Vessel profile ${it.vesselProfile.cfr} could not be found in the vessel table, skipping it.",
                    )
                }

                return@filter (it.lastPosition != null) || (it.vesselProfile != null && it.vessel != null)
            }.map { lastPositionsWithProfileAndVessel ->
                val foundVesselGroups =
                    lastPositionsWithProfileAndVessel.lastPosition?.let { lastPosition ->
                        vesselGroups.filter { vesselGroup ->
                            isInGroup(
                                vesselGroup = vesselGroup,
                                lastPosition = lastPosition,
                                now = now,
                            )
                        }
                    } ?: emptyList()

                ActiveVesselWithReferentialData(
                    lastPosition = lastPositionsWithProfileAndVessel.lastPosition,
                    vesselProfile = lastPositionsWithProfileAndVessel.vesselProfile,
                    vessel = lastPositionsWithProfileAndVessel.vessel,
                    producerOrganizationMembership = lastPositionsWithProfileAndVessel.producerOrganizationMembership,
                    riskFactor = lastPositionsWithProfileAndVessel.riskFactor ?: VesselRiskFactor(),
                    vesselGroups = foundVesselGroups,
                    activeVesselType =
                        lastPositionsWithProfileAndVessel.lastPosition?.let { ActiveVesselType.POSITION_ACTIVITY }
                            ?: ActiveVesselType.LOGBOOK_ACTIVITY,
                )
            }
    }

    private fun isInGroup(
        vesselGroup: VesselGroupBase,
        lastPosition: LastPosition,
        now: ZonedDateTime,
    ) = when (vesselGroup) {
        is DynamicVesselGroup -> lastPosition.isInGroup(vesselGroup, now)
        is FixedVesselGroup -> {
            vesselGroup.vessels.any {
                return@any it.isEqualToLastPosition(lastPosition)
            }
        }
    }
}
