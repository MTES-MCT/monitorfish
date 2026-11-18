package fr.gouv.cnsp.monitorfish.domain.use_cases.species

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.species.Species
import fr.gouv.cnsp.monitorfish.domain.repositories.SpeciesRepository

@UseCase
class GetAllSpecies(
    private val speciesRepository: SpeciesRepository,
) {
    fun execute(): List<Species> = speciesRepository.findAll().sortedBy { it.code }
}
