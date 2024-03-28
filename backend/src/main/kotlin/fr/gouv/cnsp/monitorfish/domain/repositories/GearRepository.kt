package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException

interface GearRepository {
    fun findAll(): List<Gear>

    @Throws(CodeNotFoundException::class)
    fun findByCode(code: String): Gear
}
