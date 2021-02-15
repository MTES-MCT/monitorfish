package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.Species
import fr.gouv.cnsp.monitorfish.domain.repositories.SpeciesRepository

@UseCase
class GetAllSpecies(private val species: SpeciesRepository) {
    fun execute(): List<Species> {
        return species.findAll()
    }
}