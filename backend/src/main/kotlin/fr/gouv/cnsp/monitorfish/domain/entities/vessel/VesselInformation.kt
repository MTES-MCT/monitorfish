package fr.gouv.cnsp.monitorfish.domain.entities.vessel

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.Beacon
import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor

data class VesselInformation(
    val vessel: Vessel?,
    val beacon: Beacon?,
    val positions: List<Position>,
    val vesselRiskFactor: VesselRiskFactor,
)
