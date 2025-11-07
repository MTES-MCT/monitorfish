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
    var flagState: String? = null,
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

    /**
     * Logbook messages form a linked list structure where messages reference each other via
     * `reportId` and `referencedReportId` fields. The enrichment process traverses this chain
     * to compute derived values and establish relationships between messages.
     *
     * ----
     * Message Chain Example:
     * FAR(id=1) ← COR(id=2, refId=1) ← DEL(id=3, refId=2) ← RET(id=4, refId=3)
     *    ↓             ↓                     ↓                      ↓
     *  Original    Correction           Deletion              Acknowledgment
     * ----
     *
     * == Side Effects
     *
     * This method mutates both the current message and messages in `contextMessages`:
     * - Sets `acknowledgment` on referenced messages
     * - Sets `isCorrectedByNewerMessage` on corrected messages
     * - Sets `isDeleted` on deleted messages
     * - Sets `isSentByFailoverSoftware` on E-Sacapt messages
     * - Sets name fields (gearName, portName, speciesName) on message content
     *
     * == Example: Complete Message Chain Enrichment
     *
     * ----
     * Initial state:
     * FAR(id=1, reportId=R1)
     * COR(id=2, reportId=R2, referencedReportId=R1)
     * DEL(id=3, reportId=R3, referencedReportId=R2)
     * RET(id=4, reportId=R4, referencedReportId=R3, status=SUCCESS)
     *
     * After enrichment:
     * FAR(id=1, isCorrectedByNewerMessage=true, acknowledgment={...})
     *     → Marked as corrected by COR
     *
     * COR(id=2, isCorrectedByNewerMessage=false, isDeleted=true, acknowledgment={...})
     *     → Latest correction, but deleted by DEL
     *
     * DEL(id=3, acknowledgment={isSuccess=true})
     *     → Acknowledged by RET, deletion propagated
     *
     * RET(id=4)
     *     → Processed, acknowledged DEL(id=3)
     * ----
     */
    fun enrich(
        allGears: List<Gear>,
        allPorts: List<Port>,
        allSpecies: List<Species>,
    ) {
        enrichReferenceData(allGears, allPorts, allSpecies)
        markFailoverSoftware()
    }

    fun enrichGearPortAndSpecyNames(
        allGears: List<Gear>,
        allPorts: List<Port>,
        allSpecies: List<Species>,
    ) {
        enrichReferenceData(allGears, allPorts, allSpecies)
    }

    /**
     * Enrich codes with human-readable names
     * Only DAT and COR messages contain business data that needs enrichment
     */
    private fun enrichReferenceData(
        allGears: List<Gear>,
        allPorts: List<Port>,
        allSpecies: List<Species>,
    ) {
        if (!shouldEnrichReferenceData()) return

        message?.let { messageValue ->
            when (messageValue) {
                is FAR -> setNamesFromCodes(messageValue, allGears, allSpecies)
                is CPS -> setNamesFromCodes(messageValue, allSpecies)
                is DEP -> setNamesFromCodes(messageValue, allGears, allPorts, allSpecies)
                is DIS -> setNamesFromCodes(messageValue, allSpecies)
                is COE -> setNamesFromCodes(messageValue, allSpecies)
                is COX -> setNamesFromCodes(messageValue, allSpecies)
                is CRO -> setNamesFromCodes(messageValue, allSpecies)
                is LAN -> setNamesFromCodes(messageValue, allPorts, allSpecies)
                is PNO -> setNamesFromCodes(messageValue, allPorts, allSpecies)
                is RTP -> setNamesFromCodes(messageValue, allGears, allPorts)
                else -> {} // Other message types don't need reference data enrichment
            }
        }
    }

    private fun shouldEnrichReferenceData(): Boolean =
        operationType == LogbookOperationType.DAT || operationType == LogbookOperationType.COR

    fun setAcknowledge(newLogbookMessageAcknowledgement: LogbookMessage) {
        val currentAcknowledgement = this.acknowledgment
        val newAcknowledgement = newLogbookMessageAcknowledgement.message as Acknowledgment

        val isCurrentAcknowledgementSuccessful = currentAcknowledgement?.isSuccess ?: false
        val isNewAcknowledgementSuccessful = newAcknowledgement.returnStatus == RETReturnErrorCode.SUCCESS.number

        val shouldUpdate =
            when {
                // If there is no currently calculated acknowledgement yet, create it
                currentAcknowledgement?.returnStatus == null -> true
                // Else, if the new acknowledgement message is successful while the currently calculated one is not, replace it
                isNewAcknowledgementSuccessful && !isCurrentAcknowledgementSuccessful -> true
                else -> false
            }
        if (shouldUpdate) {
            this.acknowledgment = newAcknowledgement
        }
    }

    private fun markFailoverSoftware() {
        // Mark E-Sacapt software
        if (LogbookSoftware.isESacapt(software)) {
            isSentByFailoverSoftware = true
        }
    }

    /**
     * Check if this message is auto-acknowledged (FLUX or VisioCapture)
     * These messages don't receive RET (Return Receipt) messages
     */
    fun isAutoAcknowledged(): Boolean = flagState !in listOf("FRA", "GUF", "REU", "VEN")

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
