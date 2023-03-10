package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException

interface PortRepository {
    fun findAll(): List<Port>
    fun findAllActive(): List<Port>

    @Throws(CodeNotFoundException::class)
    fun find(code: String): Port
}
