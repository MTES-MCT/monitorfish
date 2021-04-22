package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition

interface LastPositionRepository {
    fun findAll(): List<LastPosition>
}