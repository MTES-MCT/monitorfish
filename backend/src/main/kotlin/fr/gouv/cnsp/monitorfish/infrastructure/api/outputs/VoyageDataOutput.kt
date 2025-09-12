package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Voyage
import java.time.ZonedDateTime

data class VoyageDataOutput(
    val isLastVoyage: Boolean,
    val isFirstVoyage: Boolean,
    val startDate: ZonedDateTime?,
    val endDate: ZonedDateTime?,
    val tripNumber: String,
    val software: String?,
    val logbookMessages: List<LogbookMessageDataOutput>,
    val totalTripsFoundForDates: Number?,
) {
    companion object {
        fun fromVoyage(voyage: Voyage): VoyageDataOutput =
            VoyageDataOutput(
                isLastVoyage = voyage.isLastVoyage,
                isFirstVoyage = voyage.isFirstVoyage,
                startDate = voyage.startDate,
                endDate = voyage.endDate,
                tripNumber = voyage.tripNumber,
                software = voyage.software,
                logbookMessages = voyage.logbookMessages.map { LogbookMessageDataOutput.fromLogbookMessage(it) },
                totalTripsFoundForDates = voyage.totalTripsFoundForDates,
            )
    }
}
