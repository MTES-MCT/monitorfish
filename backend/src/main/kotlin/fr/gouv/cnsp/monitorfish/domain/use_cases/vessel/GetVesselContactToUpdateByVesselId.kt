package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselContactToUpdate
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselContactToUpdateRepository

@UseCase
class GetVesselContactToUpdateByVesselId(
    private val vesselContactToUpdateRepository: VesselContactToUpdateRepository,
) {
    fun execute(vesselId: Int): VesselContactToUpdate? = vesselContactToUpdateRepository.findByVesselId(vesselId)
}
