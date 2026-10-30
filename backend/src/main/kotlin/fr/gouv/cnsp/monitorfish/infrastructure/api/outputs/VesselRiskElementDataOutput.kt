package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.risk_element.NonCompliantTrip
import fr.gouv.cnsp.monitorfish.domain.entities.risk_element.RiskElementMetrics
import fr.gouv.cnsp.monitorfish.domain.entities.risk_element.VesselRiskElementAndReportings
import java.time.ZonedDateTime

data class VesselRiskElementDataOutput(
    val code: String,
    val name: String,
    val riskLevel: Int,
    val metrics: RiskElementMetricsDataOutput,
    val reportings: ReportingAndOccurrencesDataOutput?,
) {
    companion object {
        fun fromVesselRiskElementAndReportings(vesselRiskElementAndReportings: VesselRiskElementAndReportings) =
            VesselRiskElementDataOutput(
                code = vesselRiskElementAndReportings.riskElement.code,
                name = vesselRiskElementAndReportings.riskElement.name,
                riskLevel = vesselRiskElementAndReportings.riskElement.riskLevel,
                metrics =
                    RiskElementMetricsDataOutput.fromRiskElementMetrics(
                        vesselRiskElementAndReportings.riskElement.metrics,
                    ),
                reportings =
                    vesselRiskElementAndReportings.reportings?.let {
                        ReportingAndOccurrencesDataOutput.fromReportingAndOccurrences(it)
                    },
            )
    }
}

enum class RiskElementMetricsType {
    OCCURRENCES,
    TRIPS,
}

sealed class RiskElementMetricsDataOutput(
    val type: RiskElementMetricsType,
) {
    data class Trips(
        val totalTrips: Int,
        val compliantTrips: Int,
        val shareOfNonCompliantTrips: Double,
        val nonCompliantTrips: List<NonCompliantTripDataOutput>,
    ) : RiskElementMetricsDataOutput(RiskElementMetricsType.TRIPS)

    data class Occurrences(
        val occurrences: Int,
    ) : RiskElementMetricsDataOutput(RiskElementMetricsType.OCCURRENCES)

    companion object {
        fun fromRiskElementMetrics(metrics: RiskElementMetrics): RiskElementMetricsDataOutput =
            when (metrics) {
                is RiskElementMetrics.Trips ->
                    Trips(
                        totalTrips = metrics.totalTrips,
                        compliantTrips = metrics.compliantTrips,
                        shareOfNonCompliantTrips = metrics.shareOfNonCompliantTrips,
                        nonCompliantTrips =
                            metrics.nonCompliantTrips.map {
                                NonCompliantTripDataOutput
                                    .fromNonCompliantTrip(
                                        it,
                                    )
                            },
                    )
                is RiskElementMetrics.Occurrences ->
                    Occurrences(
                        occurrences = metrics.occurrences,
                    )
            }
    }
}

data class NonCompliantTripDataOutput(
    val tripNumber: String,
    val startDateTimeUtc: ZonedDateTime?,
    val endDateTimeUtc: ZonedDateTime?,
) {
    companion object {
        fun fromNonCompliantTrip(nonCompliantTrip: NonCompliantTrip) =
            NonCompliantTripDataOutput(
                tripNumber = nonCompliantTrip.tripNumber,
                startDateTimeUtc = nonCompliantTrip.startDateTimeUtc,
                endDateTimeUtc = nonCompliantTrip.endDateTimeUtc,
            )
    }
}
