package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import org.slf4j.LoggerFactory

@UseCase
class GetLastPositions(private val lastPositionRepository: LastPositionRepository,
                       private val portRepository: PortRepository) {
    private val logger = LoggerFactory.getLogger(GetLastPositions::class.java)

    fun execute(): List<LastPosition> {
        return lastPositionRepository.findAll().map {
            it.registryPortLocode?.let { departurePort ->
                try {
                    it.registryPortName = portRepository.find(departurePort).name
                } catch (e: CodeNotFoundException) {
                    logger.warn(e.message)
                }
            }

            it
        }
    }
}
