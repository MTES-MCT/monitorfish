package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import java.time.ZonedDateTime

data class Voyage(
    val isLastVoyage: Boolean,
    val isFirstVoyage: Boolean,
    val startDate: ZonedDateTime?,
    val endDate: ZonedDateTime?,
    val tripNumber: String,
    val logbookMessagesAndAlerts: LogbookMessagesAndAlerts,
)
