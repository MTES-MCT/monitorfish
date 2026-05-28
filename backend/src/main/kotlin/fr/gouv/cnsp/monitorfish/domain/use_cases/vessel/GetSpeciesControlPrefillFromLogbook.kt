package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.DIS
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.FAR
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.DiscardReason
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.SpeciesControl
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository

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

        // From FAR messages: collect faoZones and presentationCode per species
        data class FarData(val faoZones: MutableSet<String>, var presentationCode: String?)

        val farBySpecies = mutableMapOf<String, FarData>()
        messages
            .filter { it.messageType == "FAR" }
            .mapNotNull { it.message as? FAR }
            .flatMap { it.hauls }
            .flatMap { it.catches }
            .forEach { catch ->
                val species = catch.species ?: return@forEach
                val data = farBySpecies.getOrPut(species) { FarData(mutableSetOf(), null) }
                catch.faoZone?.let { data.faoZones.add(it) }
                if (data.presentationCode == null && catch.presentation != null && catch.presentation != "DIM") {
                    data.presentationCode = catch.presentation
                }
            }

        // From DIS messages: sum rejectedWeight and determine discardReason per species
        data class DisData(var rejectedWeight: Double, var hasDim: Boolean)

        val disBySpecies = mutableMapOf<String, DisData>()
        messages
            .filter { it.messageType == "DIS" }
            .mapNotNull { it.message as? DIS }
            .flatMap { it.catches }
            .forEach { catch ->
                val species = catch.species ?: return@forEach
                val data = disBySpecies.getOrPut(species) { DisData(0.0, false) }
                data.rejectedWeight += catch.weight ?: 0.0
                if (catch.presentation == "DIM") {
                    data.hasDim = true
                }
            }

        // Merge FAR and DIS into SpeciesControl list
        val allSpecies = farBySpecies.keys + disBySpecies.keys
        return allSpecies.distinct().map { species ->
            val farData = farBySpecies[species]
            val disData = disBySpecies[species]

            SpeciesControl().apply {
                speciesCode = species
                faoZones = farData?.faoZones?.toList()?.takeIf { it.isNotEmpty() }
                presentationCode = farData?.presentationCode
                rejectedWeight = disData?.rejectedWeight?.takeIf { it > 0.0 }
                discardReason =
                    disData?.let {
                        if (it.hasDim) DiscardReason.DIM else DiscardReason.DIS
                    }
            }
        }
    }
}
