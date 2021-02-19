package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Port
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException

interface PortRepository {
    fun findAll() : List<Port>
    @Throws(CodeNotFoundException::class)
    fun find(code: String): Port
}
