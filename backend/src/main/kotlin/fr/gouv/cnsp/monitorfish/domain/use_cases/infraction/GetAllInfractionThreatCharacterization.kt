package fr.gouv.cnsp.monitorfish.domain.use_cases.infraction

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.InfractionThreatCharacterization
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository

@UseCase
class GetAllInfractionThreatCharacterization(
    private val infractionRepository: InfractionRepository,
) {
    fun execute(): List<InfractionThreatCharacterization> = infractionRepository.findInfractionsThreatCharacterization()
}
