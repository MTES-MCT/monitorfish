package fr.gouv.cnsp.monitorfish.domain.use_cases.fao_areas

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.FAOAreasRepository

@UseCase
class GetFAOAreas(private val faoAreasRepository: FAOAreasRepository) {
    fun execute(): List<String> {
        val faoAreas = faoAreasRepository.findAll()

        return faoAreas.map { it.faoCode }
            .distinct()
            .sorted()
    }
}
