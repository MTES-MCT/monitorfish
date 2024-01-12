package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.*
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.*
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
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
                    setGearPortAndSpeciesNames(it)
                }

                it
            }

        flagCorrectedAcknowledgedAndDeletedMessages(messages)

        return messages.filter {
            it.operationType == LogbookOperationType.DAT ||
                it.operationType == LogbookOperationType.COR
        }
    }

    private fun setGearPortAndSpeciesNames(it: LogbookMessage) {
        when (it.messageType) {
            LogbookMessageTypeMapping.FAR.name -> {
                setNamesFromCodes(it.message as FAR)
            }
            LogbookMessageTypeMapping.CPS.name -> {
                setNamesFromCodes(it.message as CPS)
            }
            LogbookMessageTypeMapping.DEP.name -> {
                setNamesFromCodes(it.message as DEP)
            }
            LogbookMessageTypeMapping.DIS.name -> {
                setNamesFromCodes(it.message as DIS)
            }
            LogbookMessageTypeMapping.COE.name -> {
                setNamesFromCodes(it.message as COE)
            }
            LogbookMessageTypeMapping.COX.name -> {
                setNamesFromCodes(it.message as COX)
            }
            LogbookMessageTypeMapping.CRO.name -> {
                setNamesFromCodes(it.message as CRO)
            }
            LogbookMessageTypeMapping.LAN.name -> {
                setNamesFromCodes(it.message as LAN)
            }
            LogbookMessageTypeMapping.PNO.name -> {
                setNamesFromCodes(it.message as PNO)
            }
            LogbookMessageTypeMapping.RTP.name -> {
                setNamesFromCodes(it.message as RTP)
            }
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

    private fun setNamesFromCodes(message: COE) {
        message.targetSpeciesOnEntry?.let { targetSpeciesOnEntry ->
            message.targetSpeciesNameOnEntry = EffortTargetSpeciesGroup.values().find {
                it.name == targetSpeciesOnEntry
            }?.value

            if (message.targetSpeciesNameOnEntry == null) {
                try {
                    message.targetSpeciesNameOnEntry = speciesRepository.find(targetSpeciesOnEntry).name
                } catch (e: CodeNotFoundException) {
                    logger.warn(e.message)
                }
            }
        }
    }

    private fun setNamesFromCodes(message: COX) {
        message.targetSpeciesOnExit?.let { targetSpeciesOnExit ->
            message.targetSpeciesNameOnExit = EffortTargetSpeciesGroup.values().find {
                it.name == targetSpeciesOnExit
            }?.value

            if (message.targetSpeciesNameOnExit == null) {
                try {
                    message.targetSpeciesNameOnExit = speciesRepository.find(targetSpeciesOnExit).name
                } catch (e: CodeNotFoundException) {
                    logger.warn(e.message)
                }
            }
        }
    }

    private fun setNamesFromCodes(message: CRO) {
        message.targetSpeciesOnExit?.let { targetSpeciesOnExit ->
            message.targetSpeciesNameOnExit = EffortTargetSpeciesGroup.values().find {
                it.name == targetSpeciesOnExit
            }?.value

            if (message.targetSpeciesNameOnExit == null) {
                try {
                    message.targetSpeciesNameOnExit = speciesRepository.find(targetSpeciesOnExit).name
                } catch (e: CodeNotFoundException) {
                    logger.warn(e.message)
                }
            }
        }

        message.targetSpeciesOnEntry?.let { targetSpeciesOnEntry ->
            message.targetSpeciesNameOnEntry = EffortTargetSpeciesGroup.values().find {
                it.name == targetSpeciesOnEntry
            }?.value

            if (message.targetSpeciesNameOnEntry == null) {
                try {
                    message.targetSpeciesNameOnEntry = speciesRepository.find(targetSpeciesOnEntry).name
                } catch (e: CodeNotFoundException) {
                    logger.warn(e.message)
                }
            }
        }
    }

    private fun setNamesFromCodes(message: FAR) {
        message.hauls.forEach { haul ->
            haul.gear?.let { gear ->
                try {
                    haul.gearName = gearRepository.find(gear).name
                } catch (e: CodeNotFoundException) {
                    logger.warn(e.message)
                }
            }

            haul.catches.forEach { catch ->
                catch.species?.let { species ->
                    addSpeciesName(catch, species)
                }
            }
        }
    }

    private fun setNamesFromCodes(message: CPS) {
        message.catches.forEach { catch ->
            addSpeciesName(catch, catch.species)
        }
    }

    private fun setNamesFromCodes(message: DEP) {
        message.gearOnboard.forEach { gear ->
            gear.gear?.let { gearCode ->
                addGearName(gear, gearCode)
            }
        }

        message.departurePort?.let { departurePort ->
            try {
                message.departurePortName = portRepository.find(departurePort).name
            } catch (e: CodeNotFoundException) {
                logger.warn(e.message)
            }
        }

        message.speciesOnboard.forEach { catch ->
            catch.species?.let { species ->
                addSpeciesName(catch, species)
            }
        }
    }

    private fun setNamesFromCodes(message: DIS) {
        message.catches.forEach { catch ->
            catch.species?.let { species ->
                addSpeciesName(catch, species)
            }
        }
    }

    private fun setNamesFromCodes(message: LAN) {
        message.port?.let { port ->
            try {
                message.portName = portRepository.find(port).name
            } catch (e: CodeNotFoundException) {
                logger.warn(e.message)
            }
        }

        message.catchLanded.forEach { catch ->
            catch.species?.let { species ->
                addSpeciesName(catch, species)
            }
        }
    }

    private fun setNamesFromCodes(message: PNO) {
        message.port?.let { port ->
            try {
                message.portName = portRepository.find(port).name
            } catch (e: CodeNotFoundException) {
                logger.warn(e.message)
            }
        }

        message.catchOnboard.forEach { catch ->
            catch.species?.let { species ->
                addSpeciesName(catch, species)
            }
        }
    }

    private fun setNamesFromCodes(message: RTP) {
        message.port?.let { port ->
            try {
                message.portName = portRepository.find(port).name
            } catch (e: CodeNotFoundException) {
                logger.warn(e.message)
            }
        }

        message.gearOnboard.forEach { gear ->
            gear.gear?.let { gearCode ->
                addGearName(gear, gearCode)
            }
        }
    }

    private fun addSpeciesName(catch: Catch, species: String) {
        try {
            catch.speciesName = speciesRepository.find(species).name
        } catch (e: CodeNotFoundException) {
            logger.warn(e.message)
        }
    }

    private fun addSpeciesName(catch: ProtectedSpeciesCatch, species: String) {
        try {
            catch.speciesName = speciesRepository.find(species).name
        } catch (e: CodeNotFoundException) {
            logger.warn(e.message)
        }
    }

    private fun addGearName(gear: Gear, gearCode: String) {
        try {
            gear.gearName = gearRepository.find(gearCode).name
        } catch (e: CodeNotFoundException) {
            logger.warn(e.message)
        }
    }
}
