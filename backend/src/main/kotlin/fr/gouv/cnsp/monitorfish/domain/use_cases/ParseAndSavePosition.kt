package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.exceptions.NAFMessageParsingException
import fr.gouv.cnsp.monitorfish.domain.mappers.NAFMessageMapper
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class ParseAndSavePosition(private val positionRepository: PositionRepository, private val lastPositionRepository: LastPositionRepository) {
    private val logger: Logger = LoggerFactory.getLogger(ParseAndSavePosition::class.java)

    @Throws(NAFMessageParsingException::class)
    fun execute(naf: String) {
        val position = NAFMessageMapper(naf).toPosition()
        if (position.internalReferenceNumber == null) {
            logger.warn("No internal reference number for position $position")
        }
        positionRepository.save(position)

        val lastPositionSaved = lastPositionRepository.find(
                position.internalReferenceNumber ?: "",
                position.externalReferenceNumber ?: "",
                position.ircs ?: "")

        if(lastPositionSaved.isEmpty) {
            lastPositionRepository.upsert(position)
        } else if(lastPositionSaved.isPresent && lastPositionSaved.get().dateTime.isBefore(position.dateTime)) {
            lastPositionRepository.upsert(position)
        } else {
            logger.info("Position $position not saved to the last position table: this is not the latest position datetime for this vessel.")
        }

        logger.debug("Saved new position $position")
    }
}
