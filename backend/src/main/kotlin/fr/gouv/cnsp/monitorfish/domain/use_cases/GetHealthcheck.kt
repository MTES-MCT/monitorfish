package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.Health
import fr.gouv.cnsp.monitorfish.domain.entities.Species
import fr.gouv.cnsp.monitorfish.domain.repositories.ERSRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.SpeciesRepository

@UseCase
class GetHealthcheck(private val lastPositionRepository: LastPositionRepository,
                     private val positionRepository: PositionRepository,
                     private val ersRepository: ERSRepository) {
    fun execute(): Health {
        val positionDateTime = lastPositionRepository.findLastPositionDate()
        val lastPositionDateTime = positionRepository.findLastPositionDate()
        val ersMessageDateTime = ersRepository.findLastMessageDate()

        return Health(positionDateTime, lastPositionDateTime, ersMessageDateTime)
    }
}
