package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Species
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import kotlin.jvm.Throws

interface SpeciesRepository {
    fun findAll() : List<Species>
    @Throws(CodeNotFoundException::class)
    fun find(code: String): Species
}
