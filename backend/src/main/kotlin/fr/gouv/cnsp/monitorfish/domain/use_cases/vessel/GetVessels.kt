package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository

@UseCase
class GetVessels(
    private val vesselRepository: VesselRepository,
) {
    fun execute(): List<Vessel> = vesselRepository.findAll()
}
