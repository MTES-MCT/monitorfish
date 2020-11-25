package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Position

interface LastPositionRepository {
    fun findAll(): List<Position>
    fun upsert(position: Position)
}