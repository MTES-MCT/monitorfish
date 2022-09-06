package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

interface IHasImplementation {
    fun getImplementation(): Class<out AlertType>
}
