package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.*
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.entities.species.Species
import fr.gouv.cnsp.monitorfish.domain.exceptions.EntityConversionException
import java.time.ZonedDateTime

data class LogbookMessage(
    val id: Long,
    val reportId: String? = null,
    val operationNumber: String,
    val tripNumber: String? = null,
    val referencedReportId: String? = null,
    var isCorrected: Boolean = false,
    val isEnriched: Boolean,
    val operationType: LogbookOperationType,
    val operationDateTime: ZonedDateTime,
    val internalReferenceNumber: String? = null,
    val externalReferenceNumber: String? = null,
    val ircs: String? = null,
    val vesselName: String? = null,
    // ISO Alpha-3 country code
    val flagState: String? = null,
    val imo: String? = null,
    val messageType: String? = null,
    // Submission date of the report by the vessel
    val reportDateTime: ZonedDateTime? = null,
    // Reception date of the report by the data center
    val integrationDateTime: ZonedDateTime,
    var acknowledge: Acknowledge? = null,
    var deleted: Boolean = false,
    val message: LogbookMessageValue? = null,
    val analyzedByRules: List<String>,
    var rawMessage: String? = null,
    val transmissionFormat: LogbookTransmissionFormat,
    val software: String? = null,
    var isSentByFailoverSoftware: Boolean = false,
    val tripGears: List<Gear>? = listOf(),
    val tripSegments: List<LogbookTripSegment>? = listOf(),
) {
    fun <T : LogbookMessageValue> toConsolidatedLogbookMessage(
        relatedLogbookMessages: List<LogbookMessage>,
        clazz: Class<T>,
    ): ConsolidatedLogbookMessage<T> {
        if (reportId == null) {
            throw EntityConversionException(
                "Logbook report $id has no `reportId`. You can only consolidate a DAT or an orphan COR operation with a `reportId`.",
            )
        }
        if (operationType !in listOf(LogbookOperationType.DAT, LogbookOperationType.COR)) {
            throw EntityConversionException(
                "Logbook report $id has operationType '$operationType'. You can only consolidate a DAT or an orphan COR operation.",
            )
        }

        val historicallyOrderedRelatedLogbookMessages = relatedLogbookMessages.sortedBy { it.reportDateTime }
        val maybeLastLogbookMessageCorrection = historicallyOrderedRelatedLogbookMessages
            .lastOrNull { it.operationType == LogbookOperationType.COR }

        val logbookMessageBase = maybeLastLogbookMessageCorrection ?: this
        logbookMessageBase.consolidateAcknowledge(relatedLogbookMessages)
        val finalLogbookMessage = logbookMessageBase.copy(
            // We need to restore the `reportId` and `referencedReportId` to the original values
            // in case it has been consolidated from a COR operation rather than a DAT one
            reportId = reportId,
            referencedReportId = null,
            // /!\ `logbookMessageBase` might be a COR, which happens when there is no DAT at all.
            isCorrected = logbookMessageBase.operationType == LogbookOperationType.COR,
            deleted = historicallyOrderedRelatedLogbookMessages.any { it.operationType == LogbookOperationType.DEL },
        )

        return ConsolidatedLogbookMessage(
            reportId = reportId,
            logbookMessage = finalLogbookMessage,
            clazz = clazz,
        )
    }

    private fun consolidateAcknowledge(relatedLogbookMessages: List<LogbookMessage>) {
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
            val message = it.message as Acknowledge

            message.returnStatus == RETReturnErrorCode.SUCCESS.number
        }
        if (maybeLastSuccessfulRetLogbookMessage != null) {
            val lastSucessfulRetMessage = maybeLastSuccessfulRetLogbookMessage.message as Acknowledge
            this.acknowledge = lastSucessfulRetMessage.also {
                it.dateTime = maybeLastSuccessfulRetLogbookMessage.reportDateTime
                it.isSuccess = true
            }

            return
        }

        val maybeLastRetLogbookMessage = historycallyOrderedRetLogbookMessages.lastOrNull()
        if (maybeLastRetLogbookMessage != null) {
            val lastRetMessage = maybeLastRetLogbookMessage.message as Acknowledge
            this.acknowledge = lastRetMessage.also {
                it.dateTime = maybeLastRetLogbookMessage.reportDateTime
                it.isSuccess = lastRetMessage.returnStatus == RETReturnErrorCode.SUCCESS.number
            }
        }
    }

    fun setAcknowledge(newLogbookMessageAcknowledgement: LogbookMessage) {
        val currentAcknowledgement = this.acknowledge
        val newAcknowledgement = newLogbookMessageAcknowledgement.message as Acknowledge

        val isCurrentAcknowledgementSuccessful = currentAcknowledgement?.isSuccess ?: false
        val isNewAcknowledgementSuccessful = newAcknowledgement.returnStatus == RETReturnErrorCode.SUCCESS.number

        val shouldUpdate = when {
            // If there is no currently calculated acknowledgement yet, create it
            currentAcknowledgement?.dateTime == null || currentAcknowledgement.isSuccess == null -> true
            // If the new acknowledgement message is successful while the currently calculated one is not, replace it
            isNewAcknowledgementSuccessful && currentAcknowledgement.isSuccess != true -> true
            // TODO How to handle that? Check time rules with Vincent.
            newLogbookMessageAcknowledgement.reportDateTime == null -> false
            // If the new acknowledgement message is more recent than the currently calculated one, replace it
            newLogbookMessageAcknowledgement.reportDateTime > currentAcknowledgement.dateTime -> true

            else -> false
        }
        if (shouldUpdate) {
            this.acknowledge = newAcknowledgement.also {
                it.isSuccess = isCurrentAcknowledgementSuccessful || isNewAcknowledgementSuccessful
                it.dateTime = newLogbookMessageAcknowledgement.reportDateTime
            }
        }
    }

    fun setAcknowledgeAsSuccessful() {
        this.acknowledge = Acknowledge(isSuccess = true)
    }

    fun generateGearPortAndSpecyNames(
        allGears: List<fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear>,
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
        allGears: List<fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear>,
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
        allGears: List<fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear>,
        allPorts: List<Port>,
        allSpecies: List<Species>,
    ) {
        message.gearOnboard.forEach { gear ->
            gear.gear?.let { gearCode ->
                addGearName(gear, gearCode, allGears)
            }
        }

        message.departurePort?.let { departurePortLocode ->
            message.departurePortName = allPorts.find { it.locode === departurePortLocode }?.name
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
        allGears: List<fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear>,
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
        gear: Gear,
        gearCode: String,
        allGears: List<fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear>,
    ) {
        gear.gearName = allGears.find { it.code == gearCode }?.name
    }
}
