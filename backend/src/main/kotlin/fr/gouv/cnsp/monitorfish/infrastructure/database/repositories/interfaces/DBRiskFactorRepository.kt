package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.RiskFactorEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

@DynamicUpdate
interface DBRiskFactorRepository : JpaRepository<RiskFactorEntity, Int> {
    fun findByCfr(cfr: String): RiskFactorEntity

    fun findByVesselId(vesselId: Int): RiskFactorEntity

    // Only used in tests
    @Query(value = "SELECT * FROM risk_factors WHERE cfr = :cfr LIMIT 1", nativeQuery = true)
    fun findFirstByCfr(
        @Param("cfr") cfr: String,
    ): RiskFactorEntity?
}
