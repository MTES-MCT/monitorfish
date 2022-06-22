package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.controls.Controller

interface ControllerRepository {
    fun findAll(): List<Controller>
}
