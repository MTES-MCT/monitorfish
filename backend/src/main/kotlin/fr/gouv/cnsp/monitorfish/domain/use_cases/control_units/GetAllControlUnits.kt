package fr.gouv.cnsp.monitorfish.domain.use_cases.control_units

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlUnitRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.dtos.FullControlUnit

@UseCase
class GetAllControlUnits(
    private val controlUnitsRepository: ControlUnitRepository,
) {
    fun execute(): List<FullControlUnit> = controlUnitsRepository.findAll()
}
