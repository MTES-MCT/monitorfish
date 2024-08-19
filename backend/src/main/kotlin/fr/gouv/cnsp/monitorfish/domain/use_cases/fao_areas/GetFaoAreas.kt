package fr.gouv.cnsp.monitorfish.domain.use_cases.fao_areas

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.FaoAreaRepository

@UseCase
class GetFaoAreas(private val faoAreaRepository: FaoAreaRepository) {
    fun execute(): List<String> {
        val faoAreas = faoAreaRepository.findAllSortedByUsage()

        return faoAreas.map { it.faoCode }
            .distinct()
            .sorted()
    }
}
