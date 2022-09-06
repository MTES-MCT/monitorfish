package fr.gouv.cnsp.monitorfish.domain.use_cases.controller

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.controls.Controller
import fr.gouv.cnsp.monitorfish.domain.repositories.ControllerRepository

@UseCase
class GetAllControllers(private val controllerRepository: ControllerRepository) {
    fun execute(): List<Controller> {
        return controllerRepository.findAll()
    }
}
