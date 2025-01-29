package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingTwelveMonthsSummary

data class ReportingSummaryDataOutput(
    val infractionSuspicionsSummary: List<ReportingTitleAndNumberOfOccurrencesDataOutput>,
    val numberOfInfractionSuspicions: Int,
    val numberOfObservations: Int,
) {
    companion object {
        fun fromReportingSummary(reportingTwelveMonthsSummary: ReportingTwelveMonthsSummary) =
            ReportingSummaryDataOutput(
                infractionSuspicionsSummary =
                    reportingTwelveMonthsSummary.infractionSuspicionsSummary.map {
                        ReportingTitleAndNumberOfOccurrencesDataOutput.fromReportingTitleAndNumberOfOccurrences(it)
                    },
                numberOfInfractionSuspicions = reportingTwelveMonthsSummary.numberOfInfractionSuspicions,
                numberOfObservations = reportingTwelveMonthsSummary.numberOfObservations,
            )
    }
}
