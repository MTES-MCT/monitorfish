package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.DIS
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.FAR
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.DiscardReason
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.SpeciesControl
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.logbook.GetLogbookMessages

@UseCase
class GetSpeciesControlPrefillFromLogbook(
    private val logbookReportRepository: LogbookReportRepository,
    private val getLogbookMessages: GetLogbookMessages,
) {
    fun execute(cfr: String): List<SpeciesControl> {
        val trip = logbookReportRepository.findAllTrips(cfr).lastOrNull() ?: return emptyList()

        val messages =
            getLogbookMessages.execute(
                internalReferenceNumber = cfr,
                firstOperationDateTime = trip.firstOperationDateTime,
                lastOperationDateTime = trip.lastOperationDateTime,
                tripNumber = trip.tripNumber,
            )

        data class FarData(
            val faoZones: MutableSet<String>,
            val presentationCodes: MutableSet<String>,
        )

        val farBySpecies = mutableMapOf<String, FarData>()
        messages
            .filter { it.messageType == "FAR" }
            .mapNotNull { it.message as? FAR }
            .flatMap { it.hauls }
            .flatMap { it.catches }
            .forEach { catch ->
                val species = catch.species ?: return@forEach
                val data = farBySpecies.getOrPut(species) { FarData(mutableSetOf(), mutableSetOf()) }
                catch.faoZone?.let { data.faoZones.add(it) }
                catch.presentation?.let { data.presentationCodes.add(it) }
            }

        // From DIS messages: one discard entry per (species, nature), where nature is DIM when the
        // catch presentation is "DIM", otherwise DIS. RET (protected species) has no logbook signal.
        data class DisData(
            var rejectedWeight: Double,
            val faoZones: MutableSet<String>,
        )

        val disBySpeciesAndReason = mutableMapOf<Pair<String, DiscardReason>, DisData>()
        messages
            .filter { it.messageType == "DIS" }
            .mapNotNull { it.message as? DIS }
            .flatMap { it.catches }
            .forEach { catch ->
                val species = catch.species ?: return@forEach
                val discardReason = if (catch.presentation == "DIM") DiscardReason.DIM else DiscardReason.DIS
                val data = disBySpeciesAndReason.getOrPut(species to discardReason) { DisData(0.0, mutableSetOf()) }
                data.rejectedWeight += catch.weight ?: 0.0
                catch.faoZone?.let { data.faoZones.add(it) }
            }

        // Catch entries from FAR (no discardReason).
        val catches =
            farBySpecies.map { (species, farData) ->
                SpeciesControl().apply {
                    speciesCode = species
                    faoZones = farData.faoZones.toList().takeIf { it.isNotEmpty() }
                    presentationCodes = farData.presentationCodes.toList().takeIf { it.isNotEmpty() }
                }
            }

        // Discard entries from DIS (one per species + nature).
        val discards =
            disBySpeciesAndReason.map { (key, disData) ->
                val (species, reason) = key
                SpeciesControl().apply {
                    speciesCode = species
                    rejectedWeight = disData.rejectedWeight.takeIf { it > 0.0 }
                    discardReason = reason
                    faoZones = disData.faoZones.toList().takeIf { it.isNotEmpty() }
                }
            }

        return catches + discards
    }
}
