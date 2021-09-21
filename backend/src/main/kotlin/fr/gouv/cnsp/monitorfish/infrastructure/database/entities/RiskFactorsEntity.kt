package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import java.io.Serializable
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table

@Entity
@Table(name = "risk_factors")
data class RiskFactorsEntity(
        @Id
        @Column(name = "cfr")
        val cfr: String,
        @Column(name = "impact_risk_factor")
        val impactRiskFactor: Double? = null,
        @Column(name = "probability_risk_factor")
        val probabilityRiskFactor: Double? = null,
        @Column(name = "detectability_risk_factor")
        val detectabilityRiskFactor: Double? = null,
        @Column(name = "risk_factor")
        val riskFactor: Double? = null,
        ) : Serializable {

    fun toVesselRiskFactor() = VesselRiskFactor(
            impactRiskFactor = impactRiskFactor,
            probabilityRiskFactor = probabilityRiskFactor,
            detectabilityRiskFactor = detectabilityRiskFactor,
            riskFactor = riskFactor)
}
