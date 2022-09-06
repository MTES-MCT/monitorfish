package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.species.SpeciesGroup

interface SpeciesGroupRepository {
  fun findAll(): List<SpeciesGroup>
}
