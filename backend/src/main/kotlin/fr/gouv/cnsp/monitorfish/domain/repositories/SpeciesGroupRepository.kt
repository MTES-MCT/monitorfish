package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.SpeciesGroup

interface SpeciesGroupRepository {
    fun findAll() : List<SpeciesGroup>
}
