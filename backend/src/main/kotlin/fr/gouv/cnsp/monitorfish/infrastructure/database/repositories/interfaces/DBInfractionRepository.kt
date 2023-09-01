package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.InfractionEntity
import org.springframework.data.repository.CrudRepository

interface DBInfractionRepository : CrudRepository<InfractionEntity, Long> {
    fun findByNatinfCodeEquals(natinfCode: Int): InfractionEntity
}
