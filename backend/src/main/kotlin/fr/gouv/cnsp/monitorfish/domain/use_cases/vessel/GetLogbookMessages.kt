package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.Acknowledgment
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
        val datMessages = messages.filter { message -> message.operationType == LogbookOperationType.DAT }
        val corMessages = messages.filter { message -> message.operationType == LogbookOperationType.COR }
        val datCorMessages = datMessages + corMessages
        val delMessages = messages.filter { message -> message.operationType == LogbookOperationType.DEL }
        val datCorDelMessages = datMessages + corMessages + delMessages
        val retMessages = messages.filter { message -> message.operationType == LogbookOperationType.RET }

        /*
        Add flagState to DEL messages by taking the flagState from the referenced message (DEL messages themselves do
        not have a flag state). This is required to auto-acknowledge DEL messages based on the flag state.
         */
        delMessages.forEach { del ->
            val referencedMessage = messages.find { it.reportId == del.referencedReportId }
            del.flagState = referencedMessage?.flagState
        }

        // Acknowledge dat, cor and del messages
        datCorDelMessages.forEach { message ->
            if (message.isAutoAcknowledged()) {
                message.acknowledgment = Acknowledgment(isSuccess = true)
            } else {
                // Acknowledgements are referenced by operation number and not by report_id !
                val rets = retMessages.filter { ret -> ret.referencedReportId == message.operationNumber }
                rets.forEach { ret -> message.setAcknowledge(ret) }
            }
        }

        // Mark dat and cor messages that are referenced by an acknowledged DEL message as deleted
        val deletedReportIds =
            delMessages
                .filter {
                    it.acknowledgment?.isSuccess ?: false
                }.map { it.referencedReportId }
        datCorMessages.forEach { datCorMessage ->
            datCorMessage.isDeleted = deletedReportIds.contains(datCorMessage.reportId)
        }

        // Mark dat and cor messages that are referenced by an acknowledged non-deleted COR message as corrected
        val correctedReportIds =
            corMessages
                .filter {
                    !it.isDeleted && (it.acknowledgment?.isSuccess ?: false)
                }.map { it.referencedReportId }
        datCorMessages.forEach { datCorMessage ->
            datCorMessage.isCorrectedByNewerMessage = correctedReportIds.contains(datCorMessage.reportId)
        }

        datCorMessages.forEach { datCorMessage ->
            datCorMessage.enrich(
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
