package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.Control
import fr.gouv.cnsp.monitorfish.domain.repositories.*

@UseCase
class GetVesselControls(private val controlRepository: ControlRepository) {

    fun execute(vesselId: Int): List<Control> {
        return controlRepository.findVesselControls(vesselId)
    }
}
