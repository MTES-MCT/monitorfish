package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingAndOccurrences
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.ReportingDataOutput.Companion.fromReporting

data class ReportingAndOccurrencesDataOutput(
    val otherOccurrencesOfSameAlert: List<ReportingDataOutput>,
    val reporting: ReportingDataOutput,
) {
    companion object {
        fun fromReportingAndOccurrences(
            reportingAndOccurrences: ReportingAndOccurrences,
            useThreatHierarchyForForm: Boolean = false,
        ): ReportingAndOccurrencesDataOutput =
            ReportingAndOccurrencesDataOutput(
                otherOccurrencesOfSameAlert =
                    reportingAndOccurrences.otherOccurrencesOfSameAlert.map { reporting ->
                        fromReporting(
                            reporting = reporting,
                            controlUnit = reportingAndOccurrences.controlUnit
                        )
                    },
                reporting =
                    fromReporting(
                        reporting = reportingAndOccurrences.reporting,
                        controlUnit = reportingAndOccurrences.controlUnit,
                        useThreatHierarchyForForm = useThreatHierarchyForForm,
                    ),
            )
    }
}
