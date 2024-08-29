package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingAndOccurrences

data class ReportingAndOccurrencesDataOutput(
    val otherOccurrencesOfSameAlert: List<ReportingDataOutput>,
    val reporting: ReportingDataOutput,
) {
    companion object {
        fun fromReportingAndOccurrences(reportingAndOccurrences: ReportingAndOccurrences): ReportingAndOccurrencesDataOutput {
            return ReportingAndOccurrencesDataOutput(
                otherOccurrencesOfSameAlert = reportingAndOccurrences.otherOccurrencesOfSameAlert.map { reporting ->
                    ReportingDataOutput.fromReporting(reporting, reportingAndOccurrences.controlUnit)
                },
                reporting = ReportingDataOutput.fromReporting(
                    reportingAndOccurrences.reporting,
                    reportingAndOccurrences.controlUnit,
                ),
            )
        }
    }
}
