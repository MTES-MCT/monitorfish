package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPositionAIS

interface LastPositionAisRepository {
    fun findAllByCfrIsNull(): List<LastPositionAIS>

    fun findAllByCfrIsNullAndIsAtPort(isAtPort: Boolean): List<LastPositionAIS>
}
