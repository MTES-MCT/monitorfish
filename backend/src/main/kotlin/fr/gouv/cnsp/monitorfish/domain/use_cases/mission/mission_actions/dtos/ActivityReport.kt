package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.dtos

import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.actrep.ActivityCode
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel

data class ActivityReport(
    val action: MissionAction,
    val faoArea: String?,
    val segment: String?,
    val activityCode: ActivityCode,
    // The `districtCode` and `internalReferenceNumber` concatenation
    val vesselNationalIdentifier: String,
    val controlUnits: List<ControlUnit>,
    val vessel: Vessel,
)
