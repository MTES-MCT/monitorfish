package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPositionAIS

interface LastPositionAisRepository {
    fun findAll(): List<LastPositionAIS>
    fun findByIsAtPort(isAtPort: Boolean): List<LastPositionAIS>
}
