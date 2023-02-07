package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import java.time.ZonedDateTime

data class VoyageDatesAndTripNumber(
    val tripNumber: String,
    val startDate: ZonedDateTime,
    val endDate: ZonedDateTime,
)
