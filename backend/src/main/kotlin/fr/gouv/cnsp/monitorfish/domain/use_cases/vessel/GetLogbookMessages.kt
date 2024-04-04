package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.*
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.Acknowledge
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

        val messages = logbookReportRepository
            .findAllMessagesByTripNumberBetweenDates(
                internalReferenceNumber,
                afterDepartureDate,
                beforeDepartureDate,
                tripNumber,
            )
            .sortedBy { it.reportDateTime }
            .map {
                try {
                    val rawMessage = logbookRawMessageRepository.findRawMessage(it.operationNumber)
                    it.rawMessage = rawMessage
                } catch (e: NoERSMessagesFound) {
                    logger.warn(e.message)
                }

                if (it.operationType == LogbookOperationType.DAT || it.operationType == LogbookOperationType.COR) {
                    it.setGearPortAndSpeciesNames(allGears, allPorts, allSpecies)
                }

                it
            }

        flagCorrectedAcknowledgedAndDeletedMessages(messages)

        return messages.filter {
            it.operationType == LogbookOperationType.DAT ||
                it.operationType == LogbookOperationType.COR
        }
    }

    private fun flagCorrectedAcknowledgedAndDeletedMessages(messages: List<LogbookMessage>) {
        messages.forEach { logbookMessage ->
            if (logbookMessage.operationType == LogbookOperationType.COR && !logbookMessage.referencedReportId.isNullOrEmpty()) {
                flagMessageAsCorrected(messages, logbookMessage)
            } else if (logbookMessage.operationType == LogbookOperationType.RET && !logbookMessage.referencedReportId.isNullOrEmpty()) {
                flagMessageAsAcknowledged(messages, logbookMessage)
            } else if (logbookMessage.transmissionFormat == LogbookTransmissionFormat.FLUX) {
                flagMessageAsSuccess(logbookMessage)
            } else if (logbookMessage.software !== null && logbookMessage.software.contains(
                    LogbookSoftware.VISIOCAPTURE.software,
                )
            ) {
                flagMessageAsSuccess(logbookMessage)
            } else if (logbookMessage.operationType == LogbookOperationType.DEL && !logbookMessage.referencedReportId.isNullOrEmpty()) {
                flagMessageAsDeleted(messages, logbookMessage)
            }

            if (logbookMessage.software !== null && logbookMessage.software.contains(LogbookSoftware.E_SACAPT.software)) {
                logbookMessage.isSentByFailoverSoftware = true
            }
        }
    }

    private fun flagMessageAsSuccess(logbookMessage: LogbookMessage) {
        logbookMessage.acknowledge = Acknowledge()
        logbookMessage.acknowledge?.let {
            it.isSuccess = true
        }
    }

    private fun flagMessageAsDeleted(messages: List<LogbookMessage>, logbookMessage: LogbookMessage) {
        val deletedMessage = messages.find { message -> message.reportId == logbookMessage.referencedReportId }

        deletedMessage?.deleted = true
    }

    private fun flagMessageAsAcknowledged(messages: List<LogbookMessage>, acknowledgeLogbookMessage: LogbookMessage) {
        val acknowledgedOrNotMessage = messages.find { message -> message.reportId == acknowledgeLogbookMessage.referencedReportId }

        val acknowledgeDateTime = acknowledgedOrNotMessage?.acknowledge?.dateTime
        if (acknowledgeDateTime != null && acknowledgeDateTime > acknowledgeLogbookMessage.reportDateTime) {
            return
        }

        acknowledgedOrNotMessage?.acknowledge = acknowledgeLogbookMessage.message as Acknowledge
        acknowledgedOrNotMessage?.acknowledge?.let {
            it.isSuccess = it.returnStatus == RETReturnErrorCode.SUCCESS.number
            it.dateTime = acknowledgeLogbookMessage.reportDateTime
        }
    }

    private fun flagMessageAsCorrected(messages: List<LogbookMessage>, logbookMessage: LogbookMessage) {
        val correctedMessage = messages.find { message -> message.reportId == logbookMessage.referencedReportId }

        if (correctedMessage != null) {
            correctedMessage.isCorrected = true
        } else {
            logger.warn(
                "Original message ${logbookMessage.referencedReportId} corrected by message COR ${logbookMessage.operationNumber} is not found.",
            )
        }
    }
}
