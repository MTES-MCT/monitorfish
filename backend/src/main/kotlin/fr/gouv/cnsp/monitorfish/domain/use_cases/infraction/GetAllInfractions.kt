package fr.gouv.cnsp.monitorfish.domain.use_cases.infraction

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Infraction
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository

@UseCase
class GetAllInfractions(private val infractionRepository: InfractionRepository) {
    fun execute(): List<fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Infraction> {
        return infractionRepository.findAll()
    }
}
