package fr.gouv.cnsp.monitorfish.domain.entities.reporting

interface IHasImplementation {
  fun getImplementation(): Class<out InfractionSuspicionOrObservationType>
}
