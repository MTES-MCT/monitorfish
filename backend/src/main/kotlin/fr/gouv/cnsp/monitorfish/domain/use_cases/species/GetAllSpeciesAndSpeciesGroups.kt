package fr.gouv.cnsp.monitorfish.domain.use_cases.species

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.species.SpeciesAndSpeciesGroups
import fr.gouv.cnsp.monitorfish.domain.repositories.SpeciesGroupRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.SpeciesRepository

@UseCase
class GetAllSpeciesAndSpeciesGroups(
    private val speciesRepository: SpeciesRepository,
    private val speciesGroupRepository: SpeciesGroupRepository,
) {
    fun execute(): SpeciesAndSpeciesGroups {
        val species = speciesRepository.findAll()
        val groups = speciesGroupRepository.findAll()

        return SpeciesAndSpeciesGroups(species, groups)
    }
}
