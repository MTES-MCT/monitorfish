package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Position

interface PositionRepository {
    fun findAll(): List<Position>
    fun findAllByMMSI(mmsi: String): List<Position>
    fun findVesselLastPositions(internalReferenceNumber: String, externalReferenceNumber: String, ircs: String): List<Position>
    fun save(position: Position)
}