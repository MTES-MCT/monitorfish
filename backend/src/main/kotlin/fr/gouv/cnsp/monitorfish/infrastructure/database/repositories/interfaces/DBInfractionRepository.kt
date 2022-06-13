package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.InfractionEntity
import org.springframework.data.repository.CrudRepository

interface DBInfractionRepository : CrudRepository<InfractionEntity, Long> {
    fun findAllByIdIn(ids: List<Int>): List<InfractionEntity>
    fun findByNatinfCodeEquals(natinfCode: String): InfractionEntity
}
