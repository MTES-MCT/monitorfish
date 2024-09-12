package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.VesselReportings
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Year

class VesselReportingsDataOutput(
    val summary: ReportingSummaryDataOutput,
    val current: List<ReportingAndOccurrencesDataOutput>,
    val archived: Map<Year, List<ReportingAndOccurrencesDataOutput>>,
) {
    companion object {
        fun fromCurrentAndArchivedReporting(vesselReportings: VesselReportings) =
            VesselReportingsDataOutput(
                summary = ReportingSummaryDataOutput.fromReportingSummary(vesselReportings.summary),
                current =
                    vesselReportings.current.map {
                        ReportingAndOccurrencesDataOutput.fromReportingAndOccurrences(it)
                    },
                archived =
                    vesselReportings.archived.mapValues { (_, reportingAndOccurrences) ->
                        reportingAndOccurrences.map {
                            ReportingAndOccurrencesDataOutput.fromReportingAndOccurrences(it)
                        }
                    },
            )
    }
}
