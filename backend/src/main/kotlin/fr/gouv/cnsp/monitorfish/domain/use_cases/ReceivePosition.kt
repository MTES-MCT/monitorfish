package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionsRepository

@UseCase
class ReceivePosition(private val positionsRepository: PositionsRepository) {
    fun execute(position: Position) {
        positionsRepository.save(position)
    }
}
