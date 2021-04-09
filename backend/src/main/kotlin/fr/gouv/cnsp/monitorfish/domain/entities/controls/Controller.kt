package fr.gouv.cnsp.monitorfish.domain.entities.controls

data class Controller(
    var id: Int,
    var controller: String? = null,
    var controllerType: String? = null,
    var administration: String? = null
)
