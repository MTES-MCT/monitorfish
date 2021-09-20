package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor

interface RiskFactorsRepository {
    fun findVesselRiskFactors(internalReferenceNumber: String): VesselRiskFactor?
}