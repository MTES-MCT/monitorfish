package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import java.time.ZonedDateTime

interface PositionRepository {
    fun findAll(): List<Position>
    fun findAllByMmsi(mmsi: String): List<Position>
    fun findVesselLastPositionsByIrcs(
        ircs: String,
        from: ZonedDateTime,
        to: ZonedDateTime,
    ): List<Position>

    fun findVesselLastPositionsByInternalReferenceNumber(
        internalReferenceNumber: String,
        from: ZonedDateTime,
        to: ZonedDateTime,
    ): List<Position>

    fun findVesselLastPositionsByExternalReferenceNumber(
        externalReferenceNumber: String,
        from: ZonedDateTime,
        to: ZonedDateTime,
    ): List<Position>

    fun findVesselLastPositionsWithoutSpecifiedIdentifier(
        internalReferenceNumber: String,
        externalReferenceNumber: String,
        ircs: String,
        from: ZonedDateTime,
        to: ZonedDateTime,
    ): List<Position>

    fun save(position: Position)
    fun findLastPositionDate(): ZonedDateTime
}
