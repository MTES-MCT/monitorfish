package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository

@UseCase
class GetLastPositions(private val lastPositionRepository: LastPositionRepository) {
    fun execute(): List<LastPosition> {
        return lastPositionRepository.findAllInLastMonth()
    }
}
