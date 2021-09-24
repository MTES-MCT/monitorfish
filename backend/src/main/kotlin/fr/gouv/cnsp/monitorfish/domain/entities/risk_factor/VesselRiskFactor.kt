package fr.gouv.cnsp.monitorfish.domain.entities.risk_factor

// The default risk factors values are handled here
const val defaultImpactRiskFactor = 1.0
const val defaultProbabilityRiskFactor = 1.0
const val defaultDetectabilityRiskFactor = 2.0
const val defaultRiskFactor = 1.4

data class VesselRiskFactor(
        val impactRiskFactor: Double = defaultImpactRiskFactor,
        val probabilityRiskFactor: Double = defaultProbabilityRiskFactor,
        val detectabilityRiskFactor: Double = defaultDetectabilityRiskFactor,
        val riskFactor: Double = defaultRiskFactor)
