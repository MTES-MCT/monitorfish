package fr.gouv.cnsp.monitorfish.domain.use_cases.species

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.species.Species
import fr.gouv.cnsp.monitorfish.domain.repositories.SpeciesRepository

@UseCase
class GetSpeciesFromCode(
    private val speciesRepository: SpeciesRepository,
) {
    fun execute(code: String?): Species? {
        if (code.isNullOrBlank()) return null

        return try {
            speciesRepository.findByCode(code)
        } catch (e: Exception) {
            null
        }
    }
}
