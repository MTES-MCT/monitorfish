package fr.gouv.cnsp.monitorfish.domain.use_cases.control_units

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.repositories.LegacyControlUnitRepository

@UseCase
class GetAllLegacyControlUnits(
    private val legacyControlUnitsRepository: LegacyControlUnitRepository,
) {
    fun execute(): List<LegacyControlUnit> {
        return legacyControlUnitsRepository.findAll()
    }
}
