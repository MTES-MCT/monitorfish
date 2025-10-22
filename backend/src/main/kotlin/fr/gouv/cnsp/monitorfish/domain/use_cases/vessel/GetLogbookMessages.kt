package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.entities.species.Species
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
        val referenceData = loadReferenceData()

        val allMessages =
            fetchAndPrepareMessages(
                internalReferenceNumber,
                afterDepartureDate,
                beforeDepartureDate,
                tripNumber,
            )

        enrichMessages(allMessages, referenceData)

        return filterDataMessages(allMessages)
    }

    private fun loadReferenceData() =
        ReferenceData(
            gears = gearRepository.findAll(),
            ports = portRepository.findAll(),
            species = speciesRepository.findAll(),
        )

    private fun fetchAndPrepareMessages(
        internalReferenceNumber: String,
        afterDepartureDate: ZonedDateTime,
        beforeDepartureDate: ZonedDateTime,
        tripNumber: String,
    ): List<LogbookMessage> =
        logbookReportRepository
            .findAllMessagesByTripNumberBetweenDates(
                internalReferenceNumber = internalReferenceNumber,
                afterDate = afterDepartureDate,
                beforeDate = beforeDepartureDate,
                tripNumber = tripNumber,
            ).sortedBy { it.reportDateTime }
            .onEach { attachRawMessage(it) }

    private fun attachRawMessage(message: LogbookMessage) {
        message.operationNumber?.let { operationNumber ->
            try {
                message.rawMessage = logbookRawMessageRepository.findRawMessage(operationNumber)
            } catch (e: NoERSMessagesFound) {
                logger.warn(e.message)
            }
        }
    }

    private fun enrichMessages(
        messages: List<LogbookMessage>,
        referenceData: ReferenceData,
    ) {
        messages.forEach { message ->
            message.enrich(
                contextMessages = messages,
                allGears = referenceData.gears,
                allPorts = referenceData.ports,
                allSpecies = referenceData.species,
            )
        }
    }

    private fun filterDataMessages(messages: List<LogbookMessage>): List<LogbookMessage> =
        messages.filter { it.operationType in DATA_OPERATION_TYPES }

    private data class ReferenceData(
        val gears: List<Gear>,
        val ports: List<Port>,
        val species: List<Species>,
    )

    companion object {
        private val DATA_OPERATION_TYPES =
            setOf(
                LogbookOperationType.DAT,
                LogbookOperationType.COR,
            )
    }
}
