package fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType

/**
 * Snapshot of a reporting opened during the vessel's current trip at the moment of control.
 */
data class MissionActionReporting(
    val id: Int? = null,
    val type: ReportingType,
    val title: String? = null,
    val threats: List<MissionActionReportingThreat> = listOf(),
)

data class MissionActionReportingThreat(
    val natinfCode: Int? = null,
    val threat: String? = null,
    val threatCharacterization: String? = null,
)
