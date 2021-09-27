package fr.gouv.cnsp.monitorfish.domain.entities

import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor

data class VesselWithData(
        val vessel: Vessel,
        val positions: List<Position>,
        val vesselRiskFactor: VesselRiskFactor)