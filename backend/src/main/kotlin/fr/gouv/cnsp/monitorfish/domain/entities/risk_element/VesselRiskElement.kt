package fr.gouv.cnsp.monitorfish.domain.entities.risk_element

data class VesselRiskElement(
    val cfr: String,
    val code: String,
    val name: String,
    val riskLevel: Int,
    val metrics: RiskElementMetrics,
)
