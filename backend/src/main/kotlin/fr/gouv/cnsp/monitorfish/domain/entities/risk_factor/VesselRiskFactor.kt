package fr.gouv.cnsp.monitorfish.domain.entities.risk_factor

data class VesselRiskFactor(
        val impactRiskFactor: Double? = null,
        val probabilityRiskFactor: Double? = null,
        val detectabilityRiskFactor: Double? = null,
        val riskFactor: Double? = null)
