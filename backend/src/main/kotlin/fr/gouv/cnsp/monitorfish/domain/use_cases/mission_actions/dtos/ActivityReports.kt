package fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions.dtos

data class ActivityReports(
    val activityReports: List<ActivityReport>,
    // Species targeted for this JDP
    val jdpSpecies: List<String>,
)
