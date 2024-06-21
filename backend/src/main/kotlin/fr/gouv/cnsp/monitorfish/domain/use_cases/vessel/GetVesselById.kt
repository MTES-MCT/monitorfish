package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository

@UseCase
class GetVesselById(
    private val vesselRepository: VesselRepository,
) {
    fun execute(vesselId: Int): Vessel {
        return vesselRepository.findVesselById(vesselId) ?: throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND)
    }
}
