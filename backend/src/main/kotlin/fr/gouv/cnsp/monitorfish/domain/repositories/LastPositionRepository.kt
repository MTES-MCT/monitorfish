package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Position
import java.util.*

interface LastPositionRepository {
    fun findAll(): List<Position>
    fun upsert(position: Position)
    fun find(internalReferenceNumber: String,
             externalReferenceNumber: String,
             ircs: String): Optional<Position>
}