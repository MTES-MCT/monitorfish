package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.facade.SeafrontGroup
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingStats

data class ReportingsExtraDataOutput(
    val perSeafrontGroupCount: Map<SeafrontGroup, Int>,
) {
    companion object {
        fun fromReportingStats(reportingStats: ReportingStats): ReportingsExtraDataOutput =
            ReportingsExtraDataOutput(perSeafrontGroupCount = reportingStats.perSeafrontGroupCount)
    }
}
