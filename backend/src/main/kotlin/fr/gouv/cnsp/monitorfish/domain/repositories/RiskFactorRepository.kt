package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor

interface RiskFactorRepository {
    fun findAll(): List<VesselRiskFactor>

    fun findByInternalReferenceNumber(internalReferenceNumber: String): VesselRiskFactor?

    fun findFirstByInternalReferenceNumber(internalReferenceNumber: String): VesselRiskFactor?
}
