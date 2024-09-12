package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingSummary

data class ReportingSummaryDataOutput(
    val infractionSuspicionsSummary: List<ReportingTitleAndNumberOfOccurrencesDataOutput>,
    val numberOfInfractionSuspicions: Int,
    val numberOfObservations: Int,
) {
    companion object {
        fun fromReportingSummary(reportingSummary: ReportingSummary) = ReportingSummaryDataOutput(
            infractionSuspicionsSummary = reportingSummary.infractionSuspicionsSummary.map {
                ReportingTitleAndNumberOfOccurrencesDataOutput.fromReportingTitleAndNumberOfOccurrences(it)
            },
            numberOfInfractionSuspicions = reportingSummary.numberOfInfractionSuspicions,
            numberOfObservations = reportingSummary.numberOfObservations
        )
    }
}
