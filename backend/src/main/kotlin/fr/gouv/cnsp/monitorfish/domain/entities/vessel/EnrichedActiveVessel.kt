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

    val activeVesselType: ActiveVesselType

    init {
        activeVesselType = computeActiveVesselTypeFrom(lastPosition)
    }

    private fun computeActiveVesselTypeFrom(lastPosition: LastPosition?): ActiveVesselType =
        when {
            lastPosition == null -> ActiveVesselType.LOGBOOK_ACTIVITY
            else -> ActiveVesselType.POSITION_ACTIVITY
        }

    fun hasLastPositionOrVesselProfileWithVessel(): Boolean {
        if (this.lastPosition == null && this.vesselProfile != null && this.vessel == null) {
            logger.warn(
                "Vessel profile ${this.vesselProfile.cfr} could not be found in the vessel table, skipping.",
            )
        }

        return (this.lastPosition != null) || (this.vesselProfile != null && this.vessel != null)
    }
}
