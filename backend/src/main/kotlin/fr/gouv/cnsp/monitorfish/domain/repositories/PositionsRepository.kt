package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Position

interface PositionsRepository {
    fun findAll(): List<Position>
    fun save(position: Position)
}