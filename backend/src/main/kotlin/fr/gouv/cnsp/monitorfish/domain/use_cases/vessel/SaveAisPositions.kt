package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.ais_position.AisPosition
import fr.gouv.cnsp.monitorfish.domain.repositories.AisPositionRepository
import org.slf4j.LoggerFactory

@UseCase
class SaveAisPositions(
    private val aisPositionRepository: AisPositionRepository,
) {
    private val logger = LoggerFactory.getLogger(SaveAisPositions::class.java)

    fun execute(positions: List<AisPosition>) {
        logger.info("Saving ${positions.size} AIS positions.")

        aisPositionRepository.saveAll(positions)
    }
}
