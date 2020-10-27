package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionsRepository

@UseCase
class GetShipLastPositions(private val positionsRepository: PositionsRepository) {

    fun execute(internalReferenceNumber: String): List<Position> {
        return positionsRepository.findShipLastPositions(internalReferenceNumber)
                .sortedBy { it.dateTime }
    }
}