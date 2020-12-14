package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.Gear
import fr.gouv.cnsp.monitorfish.domain.repositories.GearRepository

@UseCase
class GetAllGears(private val gearRepository: GearRepository) {
    fun execute(): List<Gear> {
        return gearRepository.findAll()
    }
}