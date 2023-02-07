package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.Controller

data class ControllerDataOutput(
    var controller: String? = null,
    var controllerType: String? = null,
    var administration: String? = null,
) {
    companion object {
        fun fromController(controller: Controller) = ControllerDataOutput(
            controller = controller.controller,
            controllerType = controller.controllerType,
            administration = controller.administration,
        )
    }
}
