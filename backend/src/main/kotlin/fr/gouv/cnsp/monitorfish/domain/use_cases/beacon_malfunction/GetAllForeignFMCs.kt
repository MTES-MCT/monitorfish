package fr.gouv.cnsp.monitorfish.domain.use_cases.beacon_malfunction

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.ForeignFMC
import fr.gouv.cnsp.monitorfish.domain.repositories.ForeignFMCRepository

@UseCase
class GetAllForeignFMCs(private val foreignFMCRepository: ForeignFMCRepository) {
    fun execute(): List<ForeignFMC> {
        return foreignFMCRepository.findAll()
    }
}
