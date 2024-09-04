package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.CurrentAndArchivedReportings
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Year

class CurrentAndArchivedReportingDataOutput(
    val current: List<ReportingAndOccurrencesDataOutput>,
    val archived: Map<Year, List<ReportingAndOccurrencesDataOutput>>,
) {
    companion object {
        fun fromCurrentAndArchivedReporting(currentAndArchivedReportings: CurrentAndArchivedReportings) =
            CurrentAndArchivedReportingDataOutput(
                current =
                    currentAndArchivedReportings.current.map {
                        ReportingAndOccurrencesDataOutput.fromReportingAndOccurrences(it)
                    },
                archived =
                    currentAndArchivedReportings.archived.mapValues { (_, reportingAndOccurrences) ->
                        reportingAndOccurrences.map {
                            ReportingAndOccurrencesDataOutput.fromReportingAndOccurrences(it)
                        }
                    },
            )
    }
}
