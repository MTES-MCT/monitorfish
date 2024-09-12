package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingTitleAndNumberOfOccurrences

data class ReportingTitleAndNumberOfOccurrencesDataOutput(
    val title: String,
    val numberOfOccurrences: Int,
) {
    companion object {
        fun fromReportingTitleAndNumberOfOccurrences(reportingTitleAndNumberOfOccurrences: ReportingTitleAndNumberOfOccurrences) = ReportingTitleAndNumberOfOccurrencesDataOutput(
            title = reportingTitleAndNumberOfOccurrences.title,
            numberOfOccurrences = reportingTitleAndNumberOfOccurrences.numberOfOccurrences,
        )
    }
}
