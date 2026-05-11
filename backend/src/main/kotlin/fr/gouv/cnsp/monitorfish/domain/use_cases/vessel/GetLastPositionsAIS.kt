package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPositionAIS
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionAisRepository
import org.slf4j.LoggerFactory

@UseCase
class GetLastPositionsAIS(
    private val lastPositionsAisRepository: LastPositionAisRepository
) {
    private val logger = LoggerFactory.getLogger(GetLastPositionsAIS::class.java)

    fun execute(): List<LastPositionAIS> =
        lastPositionsAisRepository.findAll()
}
