package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.SpeciesEntity
import org.springframework.data.repository.CrudRepository

interface DBSpeciesRepository : CrudRepository<SpeciesEntity, Long> {
  fun findByCodeEquals(code: String): SpeciesEntity
}
