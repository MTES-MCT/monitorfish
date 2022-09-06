package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.species.Species
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException

interface SpeciesRepository {
    fun findAll(): List<Species>

    @Throws(CodeNotFoundException::class)
    fun find(code: String): Species
}
