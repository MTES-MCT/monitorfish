package fr.gouv.cnsp.monitorfish.domain.entities

import java.time.ZonedDateTime

data class LastDepartureDateAndTripNumber(
        val lastDepartureDate: ZonedDateTime,
        val tripNumber: Int? = null)