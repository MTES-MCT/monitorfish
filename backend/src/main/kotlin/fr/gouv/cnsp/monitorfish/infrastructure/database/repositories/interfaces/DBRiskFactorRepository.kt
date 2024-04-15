package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.RiskFactorsEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

@DynamicUpdate
interface DBRiskFactorRepository : JpaRepository<RiskFactorsEntity, Int> {
    fun findByCfr(cfr: String): RiskFactorsEntity

    // Only used in tests
    @Query(value = "SELECT * FROM risk_factors WHERE cfr = :cfr LIMIT 1", nativeQuery = true)
    fun findFirstByCfr(@Param("cfr") cfr: String): RiskFactorsEntity?
}
