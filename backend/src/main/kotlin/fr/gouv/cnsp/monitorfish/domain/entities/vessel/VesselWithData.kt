package fr.gouv.cnsp.monitorfish.domain.entities.vessel

import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor

data class VesselWithData(
    val vessel: Vessel?,
    val positions: List<Position>,
    val vesselRiskFactor: VesselRiskFactor
)
