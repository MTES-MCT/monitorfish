package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.RuleEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.repository.CrudRepository

@DynamicUpdate
interface DBRuleRepository : CrudRepository<RuleEntity, Long> {
    override fun findAll(): List<RuleEntity>
}
