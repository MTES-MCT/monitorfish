package fr.gouv.cnsp.monitorfish.domain.use_cases.port

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository

@UseCase
class GetActivePorts(private val portRepository: PortRepository) {
    fun execute(): List<Port> {
        return portRepository.findAllActive()
    }
}
