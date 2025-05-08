package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.dtos

import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.producer_organization.ProducerOrganizationMembership
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_profile.VesselProfile

data class ActiveVesselWithReferentialDataDTO(
    val lastPosition: LastPosition?,
    val vesselProfile: VesselProfile?,
    val vessel: Vessel?,
    val producerOrganizationMembership: ProducerOrganizationMembership?,
    val riskFactor: VesselRiskFactor?,
)
