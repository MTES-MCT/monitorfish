package fr.gouv.cnsp.monitorfish.domain.entities

import java.time.ZonedDateTime

data class VoyageDatesAndTripNumber(
        val tripNumber: String,
        val startDate: ZonedDateTime,
        val endDate: ZonedDateTime)
