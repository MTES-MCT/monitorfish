package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.exceptions.NAFMessageParsingException
import fr.gouv.cnsp.monitorfish.domain.mappers.NAFMessageMapper
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionsRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class ParseAndSavePosition(private val positionsRepository: PositionsRepository) {
    private val logger: Logger = LoggerFactory.getLogger(ParseAndSavePosition::class.java)

    @Throws(NAFMessageParsingException::class)
    fun execute(naf: String) {
        val position = NAFMessageMapper(naf).toPosition()
        if (position.internalReferenceNumber == null) {
            logger.warn("No internal reference number for position $position")
        }
        positionsRepository.save(position)
        logger.debug("Saved new position $position")
    }
}
