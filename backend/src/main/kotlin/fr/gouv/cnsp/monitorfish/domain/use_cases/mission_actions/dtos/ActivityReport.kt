package fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions.dtos

import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.actrep.ActivityCode
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel

data class ActivityReport(
    val action: MissionAction,
    val activityCode: ActivityCode,
    val vesselNationalIdentifier: String, // The `districtCode` and `internalReferenceNumber` concatenation
    val controlUnits: List<ControlUnit>,
    val vessel: Vessel,
)
