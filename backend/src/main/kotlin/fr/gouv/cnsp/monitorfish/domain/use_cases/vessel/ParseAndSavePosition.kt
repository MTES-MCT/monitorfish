package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.exceptions.NAFMessageParsingException
import fr.gouv.cnsp.monitorfish.domain.mappers.NAFMessageMapper
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class ParseAndSavePosition(private val positionRepository: PositionRepository) {
    private val logger: Logger = LoggerFactory.getLogger(ParseAndSavePosition::class.java)

    @Throws(NAFMessageParsingException::class)
    fun execute(naf: String) {
        val position = NAFMessageMapper(naf).toPosition()
        if (position.internalReferenceNumber == null) {
            logger.debug("No internal reference number for position $position")
        }
        positionRepository.save(position)

        logger.debug("Saved new position $position")
    }
}
