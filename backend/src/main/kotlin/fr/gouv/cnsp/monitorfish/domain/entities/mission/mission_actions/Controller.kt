package fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions

data class Controller(
    var id: Int,
    var controller: String? = null,
    var controllerType: String? = null,
    var administration: String? = null,
)
