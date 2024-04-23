package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.*
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.entities.species.Species
import fr.gouv.cnsp.monitorfish.domain.exceptions.EntityConversionException
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Gear as LogbookGear

data class LogbookMessage(
    val id: Long,
    val reportId: String? = null,
    val operationNumber: String,
    val tripNumber: String? = null,
    val referencedReportId: String? = null,
    val operationDateTime: ZonedDateTime,
    val internalReferenceNumber: String? = null,
    val externalReferenceNumber: String? = null,
    val ircs: String? = null,
    val vesselName: String? = null,
    // ISO Alpha-3 country code
    val flagState: String? = null,
    val imo: String? = null,
    // Submission date of the report by the vessel
    val reportDateTime: ZonedDateTime? = null,
    // Reception date of the report by the data center
    val integrationDateTime: ZonedDateTime,
    val analyzedByRules: List<String>,
    var rawMessage: String? = null,
    val transmissionFormat: LogbookTransmissionFormat,
    val software: String? = null,

    var acknowledgment: Acknowledgment? = null,
    var isCorrectedByNewerMessage: Boolean = false,
    var isDeleted: Boolean = false,
    val isEnriched: Boolean = false,
    var isSentByFailoverSoftware: Boolean = false,
    val message: LogbookMessageValue? = null,
    val messageType: String? = null,
    val operationType: LogbookOperationType,
    val tripGears: List<LogbookGear>? = emptyList(),
    val tripSegments: List<LogbookTripSegment>? = emptyList(),
) {
    private val logger = LoggerFactory.getLogger(LogbookMessage::class.java)

    /**
     * Returns the reference logbook message `reportId` (= the original DAT operation `reportId`).
     */
    fun getReferenceReportId(): String? {
        return referencedReportId ?: reportId
    }

    fun <T : LogbookMessageValue> toEnrichedLogbookMessageTyped(
        relatedLogbookMessages: List<LogbookMessage>,
        clazz: Class<T>,
    ): LogbookMessageTyped<T> {
        if (reportId == null) {
            throw EntityConversionException(
                "Logbook report $id has no `reportId`. You can only enrich a DAT or an orphan COR operation with a `reportId`.",
            )
        }
        if (operationType !in listOf(LogbookOperationType.DAT, LogbookOperationType.COR)) {
            throw EntityConversionException(
                "Logbook report $id has operationType '$operationType'. You can only enrich a DAT or an orphan COR operation.",
            )
        }

        val historicallySortedRelatedLogbookMessages = relatedLogbookMessages.sortedBy { it.reportDateTime }
        val maybeLastLogbookMessageCorrection = historicallySortedRelatedLogbookMessages
            .lastOrNull { it.operationType == LogbookOperationType.COR }

        val logbookMessageBase = maybeLastLogbookMessageCorrection ?: this
        logbookMessageBase.enrichAcnkowledge(relatedLogbookMessages)
        val finalLogbookMessage = logbookMessageBase.copy(
            isCorrectedByNewerMessage = false,
            isDeleted = historicallySortedRelatedLogbookMessages.any { it.operationType == LogbookOperationType.DEL },
        )

        return LogbookMessageTyped(
            logbookMessage = finalLogbookMessage,
            clazz = clazz,
        )
    }

    fun setAcknowledge(newLogbookMessageAcknowledgement: LogbookMessage) {
        val currentAcknowledgement = this.acknowledgment
        val newAcknowledgement = newLogbookMessageAcknowledgement.message as Acknowledgment

        val isCurrentAcknowledgementSuccessful = currentAcknowledgement?.isSuccess ?: false
        val isNewAcknowledgementSuccessful = newAcknowledgement.returnStatus == RETReturnErrorCode.SUCCESS.number

        val shouldUpdate = when {
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
            this.acknowledgment = newAcknowledgement.also {
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

        enrichAknowledgeCorrectionAndDeletion(contextMessages)
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

    private fun enrichAcnkowledge(relatedLogbookMessages: List<LogbookMessage>) {
        if (this.transmissionFormat == LogbookTransmissionFormat.FLUX ||
            software !== null && software.contains(LogbookSoftware.VISIOCAPTURE.software)
        ) {
            this.setAcknowledgeAsSuccessful()

            return
        }

        val historycallyOrderedRetLogbookMessages = relatedLogbookMessages
            .filter { it.operationType == LogbookOperationType.RET && it.referencedReportId == reportId }
            .sortedBy { it.reportDateTime }

        val maybeLastSuccessfulRetLogbookMessage = historycallyOrderedRetLogbookMessages.lastOrNull {
            val message = it.message as Acknowledgment

            message.returnStatus == RETReturnErrorCode.SUCCESS.number
        }
        // If there is at least one successful RET message, we consider the report as acknowledged
        if (maybeLastSuccessfulRetLogbookMessage != null) {
            val lastSucessfulRetMessage = maybeLastSuccessfulRetLogbookMessage.message as Acknowledgment
            this.acknowledgment = lastSucessfulRetMessage.also {
                it.dateTime = maybeLastSuccessfulRetLogbookMessage.reportDateTime
                it.isSuccess = true
            }

            return
        }

        // Else we consider the last (failure) RET message as the final acknowledgement
        val maybeLastRetLogbookMessage = historycallyOrderedRetLogbookMessages.lastOrNull()
        if (maybeLastRetLogbookMessage != null) {
            val lastRetMessage = maybeLastRetLogbookMessage.message as Acknowledgment
            this.acknowledgment = lastRetMessage.also {
                it.dateTime = maybeLastRetLogbookMessage.reportDateTime
                it.isSuccess = lastRetMessage.returnStatus == RETReturnErrorCode.SUCCESS.number
            }
        }
    }

    private fun enrichAknowledgeCorrectionAndDeletion(contextLogbookMessages: List<LogbookMessage>) {
        val referenceLogbookMessage = findReferencedLogbookMessage(contextLogbookMessages)
        val relatedLogbookMessages = filterRelatedLogbookMessages(contextLogbookMessages)

        when (true) {
            (operationType == LogbookOperationType.COR) -> {
                if (referenceLogbookMessage == null) {
                    logger.warn(
                        "Original message $referencedReportId corrected by message COR $operationNumber is not found.",
                    )
                }

                referenceLogbookMessage?.isCorrectedByNewerMessage = true
                setIsCorrectedByNewerMessage(relatedLogbookMessages)
            }

            (operationType == LogbookOperationType.RET && !referencedReportId.isNullOrEmpty()) -> {
                referenceLogbookMessage?.setAcknowledge(this.copy())
            }

            (transmissionFormat == LogbookTransmissionFormat.FLUX),
            (software !== null && software.contains(LogbookSoftware.VISIOCAPTURE.software)),
            -> {
                setAcknowledgeAsSuccessful()
            }

            (operationType == LogbookOperationType.DEL && !referencedReportId.isNullOrEmpty()) -> {
                referenceLogbookMessage?.isDeleted = true
            }

            else -> {}
        }

        enrichIsSentByFailoverSoftware()
    }

    private fun enrichIsSentByFailoverSoftware() {
        if (software !== null && software.contains(LogbookSoftware.E_SACAPT.software)) {
            isSentByFailoverSoftware = true
        }
    }

    private fun filterRelatedLogbookMessages(messages: List<LogbookMessage>): List<LogbookMessage> {
        return messages.filter {
            it.messageType == messageType && (
                (reportId.isNullOrEmpty() && it.referencedReportId == reportId) ||
                    (referencedReportId.isNullOrEmpty() && it.referencedReportId == referencedReportId)
                )
        }
    }

    private fun findReferencedLogbookMessage(messages: List<LogbookMessage>): LogbookMessage? {
        return if (!referencedReportId.isNullOrEmpty()) {
            messages.find { it.reportId == referencedReportId }
        } else {
            null
        }
    }

    private fun setAcknowledgeAsSuccessful() {
        this.acknowledgment = Acknowledgment(isSuccess = true)
    }

    private fun setIsCorrectedByNewerMessage(relatedMessages: List<LogbookMessage>) {
        isCorrectedByNewerMessage = relatedMessages.any {
            operationType == LogbookOperationType.COR &&
                it.reportDateTime != null &&
                it.reportDateTime > reportDateTime
        }
    }

    private fun setNamesFromCodes(message: COE, allSpecies: List<Species>) {
        message.targetSpeciesOnEntry?.let { targetSpeciesOnEntry ->
            message.targetSpeciesNameOnEntry = EffortTargetSpeciesGroup.entries.find {
                it.name == targetSpeciesOnEntry
            }?.value

            if (message.targetSpeciesNameOnEntry == null) {
                message.targetSpeciesNameOnEntry = allSpecies.find { it.code == targetSpeciesOnEntry }?.name
            }
        }
    }

    private fun setNamesFromCodes(message: COX, allSpecies: List<Species>) {
        message.targetSpeciesOnExit?.let { targetSpeciesOnExit ->
            message.targetSpeciesNameOnExit = EffortTargetSpeciesGroup.entries.find {
                it.name == targetSpeciesOnExit
            }?.value

            if (message.targetSpeciesNameOnExit == null) {
                message.targetSpeciesNameOnExit = allSpecies.find { it.code == targetSpeciesOnExit }?.name
            }
        }
    }

    private fun setNamesFromCodes(message: CRO, allSpecies: List<Species>) {
        message.targetSpeciesOnExit?.let { targetSpeciesOnExit ->
            message.targetSpeciesNameOnExit = EffortTargetSpeciesGroup.entries.find {
                it.name == targetSpeciesOnExit
            }?.value

            if (message.targetSpeciesNameOnExit == null) {
                message.targetSpeciesNameOnExit = allSpecies.find { it.code == targetSpeciesOnExit }?.name
            }
        }

        message.targetSpeciesOnEntry?.let { targetSpeciesOnEntry ->
            message.targetSpeciesNameOnEntry = EffortTargetSpeciesGroup.entries.find {
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

    private fun setNamesFromCodes(message: CPS, allSpecies: List<Species>) {
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

    private fun setNamesFromCodes(message: DIS, allSpecies: List<Species>) {
        message.catches.forEach { catch ->
            catch.species?.let { species ->
                addSpeciesName(catch, species, allSpecies)
            }
        }
    }

    private fun setNamesFromCodes(message: LAN, allPorts: List<Port>, allSpecies: List<Species>) {
        message.port?.let { portLocode ->
            message.portName = allPorts.find { it.locode == portLocode }?.name
        }

        message.catchLanded.forEach { catch ->
            catch.species?.let { species ->
                addSpeciesName(catch, species, allSpecies)
            }
        }
    }

    private fun setNamesFromCodes(message: PNO, allPorts: List<Port>, allSpecies: List<Species>) {
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

    private fun addSpeciesName(catch: Catch, species: String, allSpecies: List<Species>) {
        catch.speciesName = allSpecies.find { it.code == species }?.name
    }

    private fun addSpeciesName(catch: ProtectedSpeciesCatch, species: String, allSpecies: List<Species>) {
        catch.speciesName = allSpecies.find { it.code == species }?.name
    }

    private fun addGearName(
        gear: LogbookGear,
        gearCode: String,
        allGears: List<Gear>,
    ) {
        gear.gearName = allGears.find { it.code == gearCode }?.name
    }
}
