package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Position

interface PositionRepository {
    fun findAll(): List<Position>
    fun findAllByMMSI(MMSI: String): List<Position>
    fun findVesselLastPositions(internalReferenceNumber: String, externalReferenceNumber: String, IRCS: String): List<Position>
    fun save(position: Position)
}