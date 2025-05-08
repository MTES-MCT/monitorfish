package fr.gouv.cnsp.monitorfish.domain.entities.vessel

import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.producer_organization.ProducerOrganizationMembership
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupBase
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_profile.VesselProfile

data class ActiveVesselWithReferentialData(
    val activeVesselType: ActiveVesselType,
    val vesselGroups: List<VesselGroupBase>,
    val lastPosition: LastPosition?,
    val vesselProfile: VesselProfile?,
    val vessel: Vessel?,
    val producerOrganizationMembership: ProducerOrganizationMembership?,
    val riskFactor: VesselRiskFactor,
) {
    init {
        require(lastPosition != null || vesselProfile != null) {
            "Either a last position or vessel profile must be set."
        }

        if (lastPosition == null) {
            require(vessel != null) {
                "A vessel must be found from the referential when a vessel profile (${vesselProfile?.cfr}) is found."
            }
            require(activeVesselType === ActiveVesselType.LOGBOOK_ACTIVITY) {
                "A active vessel without a last position must be of type LOGBOOK_ACTIVITY."
            }
        }

        if (lastPosition != null) {
            require(activeVesselType === ActiveVesselType.POSITION_ACTIVITY) {
                "A active vessel with a last position must be of type VMS_ACTIVITY."
            }
        }
    }
}
