package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.SpeciesGroupEntity
import org.springframework.data.repository.CrudRepository

interface DBSpeciesGroupRepository : CrudRepository<SpeciesGroupEntity, Long>
