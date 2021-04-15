package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Position
import java.time.ZonedDateTime

interface PositionRepository {
    fun findAll(): List<Position>
    fun findAllByMmsi(mmsi: String): List<Position>
    fun findVesselLastPositions(internalReferenceNumber: String,
                                externalReferenceNumber: String,
                                ircs: String,
                                from: ZonedDateTime,
                                to: ZonedDateTime): List<Position>
    fun save(position: Position)
}