package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.CurrentAndArchivedReporting

class CurrentAndArchivedReportingDataOutput(val current: List<ReportingDataOutput>,
                                            val archived: List<ReportingDataOutput>) {
    companion object {
        fun fromCurrentAndArchivedReporting(currentAndArchivedReporting: CurrentAndArchivedReporting) = CurrentAndArchivedReportingDataOutput(
                currentAndArchivedReporting.current.map {
                    ReportingDataOutput.fromReporting(it)
                },
                currentAndArchivedReporting.archived.map {
                    ReportingDataOutput.fromReporting(it)
                })
    }
}
