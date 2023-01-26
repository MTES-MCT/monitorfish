package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.Controller

interface ControllerRepository {
    fun findAll(): List<Controller>
}
