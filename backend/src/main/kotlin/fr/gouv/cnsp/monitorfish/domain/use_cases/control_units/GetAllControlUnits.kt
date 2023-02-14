package fr.gouv.cnsp.monitorfish.domain.use_cases.control_units

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlUnit
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlUnitRepository
import kotlinx.coroutines.runBlocking
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class GetAllControlUnits(
    private val controlUnitsRepository: ControlUnitRepository,
) {
    private val logger: Logger = LoggerFactory.getLogger(GetAllControlUnits::class.java)

    fun execute(): List<ControlUnit> {
        return runBlocking {
            return@runBlocking controlUnitsRepository.findAll(this).await()
        }
    }
}
