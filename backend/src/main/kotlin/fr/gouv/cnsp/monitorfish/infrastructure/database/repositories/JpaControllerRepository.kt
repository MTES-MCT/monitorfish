package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.Controller
import fr.gouv.cnsp.monitorfish.domain.repositories.ControllerRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBControllerRepository
import org.springframework.stereotype.Repository

@Repository
class JpaControllerRepository(private val dbControllerRepository: DBControllerRepository) : ControllerRepository {

    override fun findAll(): List<Controller> {
        return dbControllerRepository.findAll().map { it.toController() }
    }
}
