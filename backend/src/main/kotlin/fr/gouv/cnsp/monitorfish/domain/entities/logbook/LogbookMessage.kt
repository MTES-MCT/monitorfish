package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.*
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.entities.species.Species
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

data class LogbookMessage(
    val id: Long?,
    val reportId: String? = null,
    val operationNumber: String?,
    val tripNumber: String? = null,
    val referencedReportId: String? = null,
    val operationDateTime: ZonedDateTime,
    val activityDateTime: ZonedDateTime? = null,
    val internalReferenceNumber: String? = null,
    val externalReferenceNumber: String? = null,
    val ircs: String? = null,
    val vesselName: String? = null,
    val vesselId: Int? = null,
    // ISO Alpha-3 country code
    val flagState: String? = null,
    val imo: String? = null,
    // Reception date of the report by the data center
    val integrationDateTime: ZonedDateTime,
    var rawMessage: String? = null,
    val transmissionFormat: LogbookTransmissionFormat,
    val software: String? = null,
    var acknowledgment: Acknowledgment? = null,
    var isCorrectedByNewerMessage: Boolean = false,
    var isDeleted: Boolean = false,
    val isEnriched: Boolean = false,
    var isSentByFailoverSoftware: Boolean = false,
    // TODO Rename to `value` to help distinguish `message` (`value`) from `LogbookMessage`.
    val message: LogbookMessageValue? = null,
    val messageType: String? = null,
    val operationType: LogbookOperationType,
    // Submission date of the report by the vessel
    val reportDateTime: ZonedDateTime?,
    val tripGears: List<LogbookTripGear>? = emptyList(),
    val tripSegments: List<LogbookTripSegment>? = emptyList(),
) {
    private val logger = LoggerFactory.getLogger(LogbookMessage::class.java)

    fun setAcknowledge(newLogbookMessageAcknowledgement: LogbookMessage) {
        val currentAcknowledgement = this.acknowledgment
        val newAcknowledgement = newLogbookMessageAcknowledgement.message as Acknowledgment

        val isCurrentAcknowledgementSuccessful = currentAcknowledgement?.isSuccess ?: false
        val isNewAcknowledgementSuccessful = newAcknowledgement.returnStatus == RETReturnErrorCode.SUCCESS.number

        val shouldUpdate =
            when {
                // If there is no currently calculated acknowledgement yet, create it
                currentAcknowledgement?.dateTime == null || currentAcknowledgement.isSuccess == null -> true
                // Else, if the new acknowledgement message is successful while the currently calculated one is not, replace it
                isNewAcknowledgementSuccessful && currentAcknowledgement.isSuccess != true -> true
                // Else, if the new failure acknowledgement message is more recent
                // than the currently calculated one (also a failure in this case), replace it
                !isNewAcknowledgementSuccessful &&
                    newLogbookMessageAcknowledgement.reportDateTime != null &&
                    newLogbookMessageAcknowledgement.reportDateTime > currentAcknowledgement.dateTime -> true

                else -> false
            }
        if (shouldUpdate) {
            this.acknowledgment =
                newAcknowledgement.also {
                    it.isSuccess = isCurrentAcknowledgementSuccessful || isNewAcknowledgementSuccessful
                    it.dateTime = newLogbookMessageAcknowledgement.reportDateTime
                }
        }
    }

    fun enrich(
        contextMessages: List<LogbookMessage>,
        allGears: List<Gear>,
        allPorts: List<Port>,
        allSpecies: List<Species>,
    ) {
        if (operationType == LogbookOperationType.DAT || operationType == LogbookOperationType.COR) {
            enrichGearPortAndSpecyNames(allGears, allPorts, allSpecies)
        }

        enrichAcknowledgeCorrectionAndDeletion(contextMessages)
    }

    fun enrichGearPortAndSpecyNames(
        allGears: List<Gear>,
        allPorts: List<Port>,
        allSpecies: List<Species>,
    ) {
        when (messageType) {
            LogbookMessageTypeMapping.FAR.name -> {
                setNamesFromCodes(message as FAR, allGears, allSpecies)
            }

            LogbookMessageTypeMapping.CPS.name -> {
                setNamesFromCodes(message as CPS, allSpecies)
            }

            LogbookMessageTypeMapping.DEP.name -> {
                setNamesFromCodes(message as DEP, allGears, allPorts, allSpecies)
            }

            LogbookMessageTypeMapping.DIS.name -> {
                setNamesFromCodes(message as DIS, allSpecies)
            }

            LogbookMessageTypeMapping.COE.name -> {
                setNamesFromCodes(message as COE, allSpecies)
            }

            LogbookMessageTypeMapping.COX.name -> {
                setNamesFromCodes(message as COX, allSpecies)
            }

            LogbookMessageTypeMapping.CRO.name -> {
                setNamesFromCodes(message as CRO, allSpecies)
            }

            LogbookMessageTypeMapping.LAN.name -> {
                setNamesFromCodes(message as LAN, allPorts, allSpecies)
            }

            LogbookMessageTypeMapping.PNO.name -> {
                setNamesFromCodes(message as PNO, allPorts, allSpecies)
            }

            LogbookMessageTypeMapping.RTP.name -> {
                setNamesFromCodes(message as RTP, allGears, allPorts)
            }
        }
    }

    private fun enrichAcknowledgeCorrectionAndDeletion(contextLogbookMessages: List<LogbookMessage>) {
        val predecessorsLogbookMessages = findPredecessorsLogbookMessagesWithoutRet(contextLogbookMessages)
        val successorsLogbookMessages = findSuccessorsLogbookMessagesWithoutRet(contextLogbookMessages)

        if (operationType == LogbookOperationType.COR) {
            if (predecessorsLogbookMessages.isEmpty()) {
                logger.warn(
                    "Original message $referencedReportId corrected by message COR $operationNumber is not found.",
                )
            }

            predecessorsLogbookMessages.forEach {
                it.isCorrectedByNewerMessage = true
            }
            setCorrectionAsCorrectedByNewerMessage(successorsLogbookMessages)
        }

        if (operationType == LogbookOperationType.RET && !referencedReportId.isNullOrEmpty()) {
            predecessorsLogbookMessages.forEach {
                it.setAcknowledge(this.copy())
            }
        }

        if (operationType == LogbookOperationType.DEL && !referencedReportId.isNullOrEmpty()) {
            predecessorsLogbookMessages.forEach {
                it.isDeleted = true
            }
        }

        if (transmissionFormat == LogbookTransmissionFormat.FLUX || LogbookSoftware.isVisioCapture(software)) {
            setAcknowledgeAsSuccessful()
        }

        enrichIsSentByFailoverSoftware()
    }

    private fun enrichIsSentByFailoverSoftware() {
        if (LogbookSoftware.isESacapt(software)) {
            isSentByFailoverSoftware = true
        }
    }

    private fun findSuccessorsLogbookMessagesWithoutRet(messages: List<LogbookMessage>): List<LogbookMessage> =
        messages.filter {
            it.operationType != LogbookOperationType.RET &&
                it.messageType == messageType &&
                it.referencedReportId == reportId
        }

    private fun findPredecessorsLogbookMessagesWithoutRet(messages: List<LogbookMessage>): List<LogbookMessage> =
        if (!referencedReportId.isNullOrEmpty()) {
            messages.filter {
                it.operationType != LogbookOperationType.RET &&
                    it.reportId == referencedReportId
            }
        } else {
            listOf()
        }

    private fun setAcknowledgeAsSuccessful() {
        this.acknowledgment = Acknowledgment(isSuccess = true)
    }

    private fun setCorrectionAsCorrectedByNewerMessage(successorsLogbookMessages: List<LogbookMessage>) {
        isCorrectedByNewerMessage =
            successorsLogbookMessages.any {
                operationType == LogbookOperationType.COR &&
                    it.reportDateTime != null &&
                    it.reportDateTime > reportDateTime
            }
    }

    private fun setNamesFromCodes(
        message: COE,
        allSpecies: List<Species>,
    ) {
        message.targetSpeciesOnEntry?.let { targetSpeciesOnEntry ->
            message.targetSpeciesNameOnEntry =
                EffortTargetSpeciesGroup.entries
                    .find {
                        it.name == targetSpeciesOnEntry
                    }?.value

            if (message.targetSpeciesNameOnEntry == null) {
                message.targetSpeciesNameOnEntry = allSpecies.find { it.code == targetSpeciesOnEntry }?.name
            }
        }
    }

    private fun setNamesFromCodes(
        message: COX,
        allSpecies: List<Species>,
    ) {
        message.targetSpeciesOnExit?.let { targetSpeciesOnExit ->
            message.targetSpeciesNameOnExit =
                EffortTargetSpeciesGroup.entries
                    .find {
                        it.name == targetSpeciesOnExit
                    }?.value

            if (message.targetSpeciesNameOnExit == null) {
                message.targetSpeciesNameOnExit = allSpecies.find { it.code == targetSpeciesOnExit }?.name
            }
        }
    }

    private fun setNamesFromCodes(
        message: CRO,
        allSpecies: List<Species>,
    ) {
        message.targetSpeciesOnExit?.let { targetSpeciesOnExit ->
            message.targetSpeciesNameOnExit =
                EffortTargetSpeciesGroup.entries
                    .find {
                        it.name == targetSpeciesOnExit
                    }?.value

            if (message.targetSpeciesNameOnExit == null) {
                message.targetSpeciesNameOnExit = allSpecies.find { it.code == targetSpeciesOnExit }?.name
            }
        }

        message.targetSpeciesOnEntry?.let { targetSpeciesOnEntry ->
            message.targetSpeciesNameOnEntry =
                EffortTargetSpeciesGroup.entries
                    .find {
                        it.name == targetSpeciesOnEntry
                    }?.value

            if (message.targetSpeciesNameOnEntry == null) {
                message.targetSpeciesNameOnEntry = allSpecies.find { it.code == targetSpeciesOnEntry }?.name
            }
        }
    }

    private fun setNamesFromCodes(
        message: FAR,
        allGears: List<Gear>,
        allSpecies: List<Species>,
    ) {
        message.hauls.forEach { haul ->
            haul.gear?.let { gear ->
                haul.gearName = allGears.find { it.code == gear }?.name
            }

            haul.catches.forEach { catch ->
                catch.species?.let { species ->
                    addSpeciesName(catch, species, allSpecies)
                }
            }
        }
    }

    private fun setNamesFromCodes(
        message: CPS,
        allSpecies: List<Species>,
    ) {
        message.catches.forEach { catch ->
            addSpeciesName(catch, catch.species, allSpecies)
        }
    }

    private fun setNamesFromCodes(
        message: DEP,
        allGears: List<Gear>,
        allPorts: List<Port>,
        allSpecies: List<Species>,
    ) {
        message.gearOnboard.forEach { gear ->
            gear.gear?.let { gearCode ->
                addGearName(gear, gearCode, allGears)
            }
        }

        message.departurePort?.let { departurePortLocode ->
            message.departurePortName = allPorts.find { it.locode == departurePortLocode }?.name
        }

        message.speciesOnboard.forEach { catch ->
            catch.species?.let { species ->
                addSpeciesName(catch, species, allSpecies)
            }
        }
    }

    private fun setNamesFromCodes(
        message: DIS,
        allSpecies: List<Species>,
    ) {
        message.catches.forEach { catch ->
            catch.species?.let { species ->
                addSpeciesName(catch, species, allSpecies)
            }
        }
    }

    private fun setNamesFromCodes(
        message: LAN,
        allPorts: List<Port>,
        allSpecies: List<Species>,
    ) {
        message.port?.let { portLocode ->
            message.portName = allPorts.find { it.locode == portLocode }?.name
        }

        message.catchLanded.forEach { catch ->
            catch.species?.let { species ->
                addSpeciesName(catch, species, allSpecies)
            }
        }
    }

    private fun setNamesFromCodes(
        message: PNO,
        allPorts: List<Port>,
        allSpecies: List<Species>,
    ) {
        message.port?.let { arrivalPortLocode ->
            message.portName = allPorts.find { it.locode == arrivalPortLocode }?.name
        }

        message.catchOnboard.forEach { catch ->
            catch.species?.let { species ->
                addSpeciesName(catch, species, allSpecies)
            }
        }
    }

    private fun setNamesFromCodes(
        message: RTP,
        allGears: List<Gear>,
        allPorts: List<Port>,
    ) {
        message.port?.let { portLocode ->
            message.portName = allPorts.find { it.locode == portLocode }?.name
        }

        message.gearOnboard.forEach { gear ->
            gear.gear?.let { gearCode ->
                addGearName(gear, gearCode, allGears)
            }
        }
    }

    private fun addSpeciesName(
        catch: LogbookFishingCatch,
        species: String,
        allSpecies: List<Species>,
    ) {
        catch.speciesName = allSpecies.find { it.code == species }?.name
    }

    private fun addSpeciesName(
        catch: ProtectedSpeciesCatch,
        species: String,
        allSpecies: List<Species>,
    ) {
        catch.speciesName = allSpecies.find { it.code == species }?.name
    }

    private fun addGearName(
        gear: LogbookTripGear,
        gearCode: String,
        allGears: List<Gear>,
    ) {
        gear.gearName = allGears.find { it.code == gearCode }?.name
    }
}
