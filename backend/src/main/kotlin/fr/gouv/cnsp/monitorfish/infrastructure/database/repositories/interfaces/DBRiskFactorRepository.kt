package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.RiskFactorsEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.jpa.repository.JpaRepository

@DynamicUpdate
interface DBRiskFactorRepository : JpaRepository<RiskFactorsEntity, Int> {
    fun findByCfr(cfr: String): RiskFactorsEntity
}
