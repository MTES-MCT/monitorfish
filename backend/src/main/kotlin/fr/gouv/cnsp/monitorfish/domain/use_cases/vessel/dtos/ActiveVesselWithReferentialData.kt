package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.dtos

import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_profile.VesselProfile
import org.slf4j.Logger
import org.slf4j.LoggerFactory

data class ActiveVesselWithReferentialDataDTO(
    val lastPosition: LastPosition?,
    val vesselProfile: VesselProfile?,
    val vessel: Vessel?,
    val producerOrganizationName: String?,
    val riskFactor: VesselRiskFactor = VesselRiskFactor(),
) {
    private val logger: Logger = LoggerFactory.getLogger(ActiveVesselWithReferentialDataDTO::class.java)

    fun hasLastPositionOrVesselProfileWithVessel(): Boolean {
        if (this.lastPosition == null && this.vesselProfile != null && this.vessel == null) {
            logger.warn(
                "Vessel profile ${this.vesselProfile.cfr} could not be found in the vessel table, skipping.",
            )
        }

        return (this.lastPosition != null) || (this.vesselProfile != null && this.vessel != null)
    }
}
