package fr.gouv.cnsp.monitorfish.infrastructure.api.contract

/**
 * Snapshot of a reporting opened during the vessel's current trip at the moment of control.
 */
data class MissionActionReportingDataOutput(
    val id: Int? = null,
    val type: ReportingType,
    val title: String? = null,
    val threats: List<MissionActionReportingThreatDataOutput> = listOf(),
)

data class MissionActionReportingThreatDataOutput(
    val natinfCode: Int? = null,
    val threat: String? = null,
    val threatCharacterization: String? = null,
)

/**
 * Snapshot of a shared group the vessel belonged to at the moment of control.
 */
data class MissionActionVesselGroupDataOutput(
    val id: Int? = null,
    val name: String,
    val color: String,
    val type: GroupType,
    val isPriorityGroup: Boolean = false,
)

data class MissionActionControlUnitDataOutput(
    val id: Int,
    val administration: String,
    val isArchived: Boolean,
    val name: String,
    val resources: List<MissionActionControlResourceDataOutput>,
    val contact: String? = null,
)

data class MissionActionControlResourceDataOutput(
    val id: Int,
    val name: String,
    val type: ControlUnitResourceType,
)
