package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PortEntity
import org.springframework.data.repository.CrudRepository

interface DBPortRepository : CrudRepository<PortEntity, Long> {
    fun findByLocodeEquals(locode: String): PortEntity
    fun findAllByIsActiveIsTrue(): List<PortEntity>
}
