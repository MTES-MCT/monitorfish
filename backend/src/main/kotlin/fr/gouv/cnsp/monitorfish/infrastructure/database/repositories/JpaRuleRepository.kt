package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.rules.Rule
import fr.gouv.cnsp.monitorfish.domain.repositories.RuleRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBRuleRepository
import org.springframework.stereotype.Repository

@Repository
class JpaRuleRepository(
    private val dbRuleRepository: DBRuleRepository,
    private val mapper: ObjectMapper,
) : RuleRepository {

    override fun findAll(): List<Rule> {
        return dbRuleRepository.findAll().map {
            it.toRule(mapper)
        }
    }
}
