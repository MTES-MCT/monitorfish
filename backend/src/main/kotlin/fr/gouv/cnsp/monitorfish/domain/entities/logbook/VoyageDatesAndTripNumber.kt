package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import java.time.ZonedDateTime

data class VoyageDatesAndTripNumber(
    val tripNumber: String,
    val firstOperationDateTime: ZonedDateTime,
    val lastOperationDateTime: ZonedDateTime,
    val startDateTime: ZonedDateTime,
    val endDateTime: ZonedDateTime,
)
