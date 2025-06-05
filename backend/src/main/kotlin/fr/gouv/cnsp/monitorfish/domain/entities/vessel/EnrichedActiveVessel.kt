package fr.gouv.cnsp.monitorfish.domain.entities.vessel

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.Beacon
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.producer_organization.ProducerOrganizationMembership
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupBase
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_profile.VesselProfile
import org.slf4j.Logger
import org.slf4j.LoggerFactory

data class EnrichedActiveVessel(
    var vesselGroups: List<VesselGroupBase> = listOf(),
    val lastPosition: LastPosition?,
    val beacon: Beacon? = null,
    val vesselProfile: VesselProfile?,
    val vessel: Vessel?,
    val producerOrganization: ProducerOrganizationMembership?,
    val riskFactor: VesselRiskFactor,
) {
    private val logger: Logger = LoggerFactory.getLogger(EnrichedActiveVessel::class.java)

    val activityType: ActivityType
    val segments: List<String>
    val gearsArray: List<String>
    val activityOrigin: ActivityOrigin

    init {
        activityType = computeActivityTypeFrom(lastPosition)
        activityOrigin = computeActivityOriginFrom(lastPosition)

        segments =
            if (activityOrigin == ActivityOrigin.FROM_LOGBOOK) {
                lastPosition?.segments ?: listOf()
            } else {
                vesselProfile
                    ?.recentSegments
                    ?.keys
                    ?.toList()
                    ?.filter { it != "NO_SEGMENTS" } ?: listOf()
            }

        gearsArray =
            if (activityOrigin == ActivityOrigin.FROM_LOGBOOK) {
                lastPosition?.gearOnboard?.mapNotNull { it.gear }?.distinct() ?: listOf()
            } else {
                vesselProfile
                    ?.recentGears
                    ?.keys
                    ?.toList()
                    ?.distinct() ?: listOf()
            }
    }

    private fun computeActivityOriginFrom(lastPosition: LastPosition?): ActivityOrigin {
        val isEmittingLogbookCurrently = lastPosition?.gearOnboard?.isNotEmpty() ?: false

        return when {
            !isEmittingLogbookCurrently -> ActivityOrigin.FROM_RECENT_PROFILE
            else -> ActivityOrigin.FROM_LOGBOOK
        }
    }

    private fun computeActivityTypeFrom(lastPosition: LastPosition?): ActivityType =
        when {
            lastPosition == null -> ActivityType.LOGBOOK_BASED
            else -> ActivityType.POSITION_BASED
        }

    fun hasEitherLastPositionOrVesselProfileWithVessel(): Boolean {
        if (this.lastPosition == null && this.vesselProfile != null && this.vessel == null) {
            logger.warn(
                "Vessel profile ${this.vesselProfile.cfr} could not be found in the vessel table, skipping.",
            )
        }

        return (this.lastPosition != null) || (this.vesselProfile != null && this.vessel != null)
    }
}
