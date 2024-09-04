package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSMessagesFound
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetLogbookMessages(
    private val logbookReportRepository: LogbookReportRepository,
    private val gearRepository: GearRepository,
    private val speciesRepository: SpeciesRepository,
    private val portRepository: PortRepository,
    private val logbookRawMessageRepository: LogbookRawMessageRepository,
) {
    private val logger = LoggerFactory.getLogger(GetLogbookMessages::class.java)

    fun execute(
        internalReferenceNumber: String,
        afterDepartureDate: ZonedDateTime,
        beforeDepartureDate: ZonedDateTime,
        tripNumber: String,
    ): List<LogbookMessage> {
        val allGears = gearRepository.findAll()
        val allPorts = portRepository.findAll()
        val allSpecies = speciesRepository.findAll()

        val messages =
            logbookReportRepository
                .findAllMessagesByTripNumberBetweenDates(
                    internalReferenceNumber,
                    afterDepartureDate,
                    beforeDepartureDate,
                    tripNumber,
                )
                .sortedBy { it.reportDateTime }
                .map { logbookMessage ->
                    logbookMessage.operationNumber?.let { operationNumber ->
                        try {
                            val rawMessage = logbookRawMessageRepository.findRawMessage(operationNumber)
                            logbookMessage.rawMessage = rawMessage
                        } catch (e: NoERSMessagesFound) {
                            logger.warn(e.message)
                        }
                    }

                    logbookMessage
                }

        messages.forEach { it.enrich(messages, allGears, allPorts, allSpecies) }

        return messages.filter {
            it.operationType == LogbookOperationType.DAT ||
                it.operationType == LogbookOperationType.COR
        }
    }
}
