package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions.dtos.ActivityReports

data class ActivityReportsDataOutput(
    val activityReports: List<ActivityReportDataOutput>,
    val jdpSpecies: List<String>,
) {
    companion object {
        fun fromActivityReports(activityReports: ActivityReports) = ActivityReportsDataOutput(
            activityReports = activityReports.activityReports.map { ActivityReportDataOutput.fromActivityReport(it) },
            jdpSpecies = activityReports.jdpSpecies,
        )
    }
}
