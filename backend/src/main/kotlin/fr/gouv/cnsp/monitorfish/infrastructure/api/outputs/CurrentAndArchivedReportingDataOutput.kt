package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.CurrentAndArchivedReportings

class CurrentAndArchivedReportingDataOutput(
    val current: List<ReportingDataOutput>,
    val archived: List<ReportingDataOutput>,
) {
    companion object {
        fun fromCurrentAndArchivedReporting(
            currentAndArchivedReportings: CurrentAndArchivedReportings,
        ) = CurrentAndArchivedReportingDataOutput(
            currentAndArchivedReportings.current.map {
                ReportingDataOutput.fromReporting(it.first, it.second)
            },
            currentAndArchivedReportings.archived.map {
                ReportingDataOutput.fromReporting(it.first, it.second)
            },
        )
    }
}
