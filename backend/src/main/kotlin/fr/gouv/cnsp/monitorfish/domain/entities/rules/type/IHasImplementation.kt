package fr.gouv.cnsp.monitorfish.domain.entities.rules.type

interface IHasImplementation {
  fun getImplementation(): Class<out RuleType>
}
