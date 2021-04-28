package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.ers.*
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.*
import fr.gouv.cnsp.monitorfish.domain.entities.ERSMessagesAndAlerts
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSMessagesFound
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import org.slf4j.LoggerFactory

@UseCase
class GetVesselLastVoyage(private val ersRepository: ERSRepository,
                          private val gearRepository: GearRepository,
                          private val speciesRepository: SpeciesRepository,
                          private val portRepository: PortRepository,
                          private val alertRepository: AlertRepository,
                          private val ersMessageRepository: ERSMessageRepository) {
    private val logger = LoggerFactory.getLogger(GetVesselLastVoyage::class.java)

    fun execute(internalReferenceNumber: String): ERSMessagesAndAlerts {
        val lastDepartureDateAndTripNumber = ersRepository.findLastDepartureDateAndTripNumber(internalReferenceNumber)

        val alerts = lastDepartureDateAndTripNumber.tripNumber?.let {
            alertRepository.findAlertsOfRules(
                    listOf(AlertTypeMapping.PNO_LAN_WEIGHT_TOLERANCE_ALERT),
                    internalReferenceNumber,
                    it)
        } ?: listOf()

        val messages = ersRepository
                .findAllMessagesAfterDepartureDate(lastDepartureDateAndTripNumber.lastDepartureDate, internalReferenceNumber)
                .sortedBy { it.operationDateTime }
                .map {
                    try {
                        val rawMessage = ersMessageRepository.findRawMessage(it.operationNumber)
                        it.rawMessage = rawMessage
                    } catch (e: NoERSMessagesFound) {
                        logger.warn(e.message)
                    }

                    if(it.operationType == ERSOperationType.DAT || it.operationType == ERSOperationType.COR) {
                        when (it.messageType) {
                            ERSMessageTypeMapping.FAR.name -> {
                                setNamesFromCodes(it.message as FAR)
                            }
                            ERSMessageTypeMapping.DEP.name -> {
                                setNamesFromCodes(it.message as DEP)
                            }
                            ERSMessageTypeMapping.DIS.name -> {
                                setNamesFromCodes(it.message as DIS)
                            }
                            ERSMessageTypeMapping.COE.name -> {
                                setNamesFromCodes(it.message as COE)
                            }
                            ERSMessageTypeMapping.COX.name -> {
                                setNamesFromCodes(it.message as COX)
                            }
                            ERSMessageTypeMapping.CRO.name -> {
                                setNamesFromCodes(it.message as CRO)
                            }
                            ERSMessageTypeMapping.LAN.name -> {
                                setNamesFromCodes(it.message as LAN)
                            }
                            ERSMessageTypeMapping.PNO.name -> {
                                setNamesFromCodes(it.message as PNO)
                            }
                            ERSMessageTypeMapping.RTP.name -> {
                                setNamesFromCodes(it.message as RTP)
                            }
                        }
                    }

                    it
                }

        flagCorrectedAndAcknowledgedMessages(messages)

        val ersMessages = messages.filter {
            it.operationType == ERSOperationType.DAT ||
                    it.operationType == ERSOperationType.COR
        }

        return ERSMessagesAndAlerts(ersMessages, alerts)
    }

    private fun flagCorrectedAndAcknowledgedMessages(messages: List<ERSMessage>) {
        messages.forEach { ersMessage ->
            if (ersMessage.operationType == ERSOperationType.COR &&
                    !ersMessage.referencedErsId.isNullOrEmpty()) {
                val correctedMessage = messages.find { message -> message.ersId == ersMessage.referencedErsId }

                if(correctedMessage != null) {
                    correctedMessage.isCorrected = true
                } else {
                    logger.warn("Original message ${ersMessage.referencedErsId} corrected by message COR ${ersMessage.operationNumber} is not found.")
                }
            } else if (ersMessage.operationType == ERSOperationType.RET &&
                    !ersMessage.referencedErsId.isNullOrEmpty()) {
                val foundOriginalMessage = messages.find { message -> message.ersId == ersMessage.referencedErsId }
                foundOriginalMessage?.acknowledge = ersMessage.message as Acknowledge
                foundOriginalMessage?.acknowledge?.let {
                    it.isSuccess = it.returnStatus == RETReturnErrorCode.SUCCESS.number
                }
            } else if (ersMessage.operationType == ERSOperationType.DEL &&
                    !ersMessage.referencedErsId.isNullOrEmpty()) {
                val deletedMessage = messages.find { message -> message.ersId == ersMessage.referencedErsId }
                deletedMessage?.deleted = true
            }
        }
    }

    private fun setNamesFromCodes(message: COE) {
        message.targetSpeciesOnEntry?.let { targetSpeciesOnEntry ->
            try {
                message.targetSpeciesNameOnEntry = speciesRepository.find(targetSpeciesOnEntry).name
            } catch (e: CodeNotFoundException) {
                logger.warn(e.message)
            }
        }
    }

    private fun setNamesFromCodes(message: COX) {
        message.targetSpeciesOnExit?.let { targetSpeciesOnEntry ->
            try {
                message.targetSpeciesNameOnExit = speciesRepository.find(targetSpeciesOnEntry).name
            } catch (e: CodeNotFoundException) {
                logger.warn(e.message)
            }
        }
    }

    private fun setNamesFromCodes(message: CRO) {
        message.targetSpeciesOnExit?.let { targetSpeciesOnEntry ->
            try {
                message.targetSpeciesNameOnExit = speciesRepository.find(targetSpeciesOnEntry).name
            } catch (e: CodeNotFoundException) {
                logger.warn(e.message)
            }
        }

        message.targetSpeciesOnEntry?.let { targetSpeciesOnEntry ->
            try {
                message.targetSpeciesNameOnEntry = speciesRepository.find(targetSpeciesOnEntry).name
            } catch (e: CodeNotFoundException) {
                logger.warn(e.message)
            }
        }
    }

    private fun setNamesFromCodes(message: FAR) {
        message.gear?.let { gear ->
            try {
                message.gearName = gearRepository.find(gear).name
            } catch (e: CodeNotFoundException) {
                logger.warn(e.message)
            }
        }

        message.catches.forEach { catch ->
            catch.species?.let { species ->
                addSpeciesName(catch, species)
            }
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

    private fun addGearName(gear: Gear, gearCode: String) {
        try {
            gear.gearName = gearRepository.find(gearCode).name
        } catch (e: CodeNotFoundException) {
            logger.warn(e.message)
        }
    }
}
