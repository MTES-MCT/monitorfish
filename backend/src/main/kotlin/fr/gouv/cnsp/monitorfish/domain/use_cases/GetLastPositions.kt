package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionRepository

@UseCase
class GetLastPositions(private val positionRepository: PositionRepository) {

    fun execute(): List<Position> {
        return positionRepository.findAllLastDistinctPositions()
    }
}