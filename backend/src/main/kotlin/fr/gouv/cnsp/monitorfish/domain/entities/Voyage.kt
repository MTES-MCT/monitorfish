package fr.gouv.cnsp.monitorfish.domain.entities

import java.time.ZonedDateTime

data class Voyage(
        val isLastVoyage: Boolean,
        val isFirstVoyage: Boolean,
        val startDate: ZonedDateTime?,
        val endDate: ZonedDateTime?,
        val tripNumber: Int,
        val logbookMessagesAndAlerts: LogbookMessagesAndAlerts)
