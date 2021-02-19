package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.rules.Rule

interface RuleRepository {
    fun findAll() : List<Rule>
}
