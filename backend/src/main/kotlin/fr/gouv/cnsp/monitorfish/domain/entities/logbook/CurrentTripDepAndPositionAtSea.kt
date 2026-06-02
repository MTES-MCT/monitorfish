package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import java.time.ZonedDateTime

data class CurrentTripDepAndPositionAtSea(
    val departureDateTime: ZonedDateTime,
    val firstPositionAtSeaOfLastTripDateTime: ZonedDateTime?,
)
