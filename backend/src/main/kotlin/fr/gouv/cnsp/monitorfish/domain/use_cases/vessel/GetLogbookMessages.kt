package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookSoftware
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTransmissionFormat
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
                    it.generateGearPortAndSpecyNames(allGears, allPorts, allSpecies)
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
            val referenceLogbookMessage = if (!logbookMessage.referencedReportId.isNullOrEmpty()) {
                messages.find { it.reportId == logbookMessage.referencedReportId }
            } else {
                null
            }

            if (logbookMessage.operationType == LogbookOperationType.COR && !logbookMessage.referencedReportId.isNullOrEmpty()) {
                if (referenceLogbookMessage == null) {
                    logger.warn(
                        "Original message ${logbookMessage.referencedReportId} corrected by message COR ${logbookMessage.operationNumber} is not found.",
                    )
                }

                referenceLogbookMessage?.isCorrected = true
            } else if (logbookMessage.operationType == LogbookOperationType.RET && !logbookMessage.referencedReportId.isNullOrEmpty()) {
                referenceLogbookMessage?.setAcknowledge(logbookMessage)
            } else if (logbookMessage.transmissionFormat == LogbookTransmissionFormat.FLUX) {
                logbookMessage.setAcknowledgeAsSuccessful()
            } else if (
                logbookMessage.software !== null &&
                logbookMessage.software.contains(LogbookSoftware.VISIOCAPTURE.software)
            ) {
                logbookMessage.setAcknowledgeAsSuccessful()
            } else if (logbookMessage.operationType == LogbookOperationType.DEL && !logbookMessage.referencedReportId.isNullOrEmpty()) {
                referenceLogbookMessage?.deleted = true
            }

            if (logbookMessage.software !== null && logbookMessage.software.contains(LogbookSoftware.E_SACAPT.software)) {
                logbookMessage.isSentByFailoverSoftware = true
            }
        }
    }
}
