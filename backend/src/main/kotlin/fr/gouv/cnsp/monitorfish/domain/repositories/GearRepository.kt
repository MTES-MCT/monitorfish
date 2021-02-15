package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Gear
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import kotlin.jvm.Throws

interface GearRepository {
    fun findAll() : List<Gear>
    @Throws(CodeNotFoundException::class)
    fun find(code: String): Gear
}
