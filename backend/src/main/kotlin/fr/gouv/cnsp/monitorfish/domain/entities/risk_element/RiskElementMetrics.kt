package fr.gouv.cnsp.monitorfish.domain.entities.risk_element

import java.time.ZonedDateTime

sealed class RiskElementMetrics {
    data class Trips(
        val totalTrips: Int,
        val compliantTrips: Int,
        val shareOfNonCompliantTrips: Double,
        /** Sorted from the most recent trip to the oldest one */
        val nonCompliantTrips: List<NonCompliantTrip>,
    ) : RiskElementMetrics()

    data class Occurrences(
        val occurrences: Int,
        /** Sorted from the most recent occurrence to the oldest one */
        val reportingIds: List<Int> = emptyList(),
        val beaconMalfunctionIds: List<Int> = emptyList(),
    ) : RiskElementMetrics()
}

data class NonCompliantTrip(
    val tripNumber: String,
    /** `null` when the trip is not found in the trips snapshot */
    val startDateTimeUtc: ZonedDateTime?,
    val endDateTimeUtc: ZonedDateTime?,
)
