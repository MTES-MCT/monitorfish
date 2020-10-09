package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.exceptions.NAFMessageParsingException
import fr.gouv.cnsp.monitorfish.domain.mappers.NAFMessageMapper
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionsRepository

@UseCase
class ParseAndSavePosition(private val positionsRepository: PositionsRepository) {
    @Throws(NAFMessageParsingException::class)
    fun execute(naf: String) {
        val position = NAFMessageMapper(naf).toPosition()
        positionsRepository.save(position)
    }
}
