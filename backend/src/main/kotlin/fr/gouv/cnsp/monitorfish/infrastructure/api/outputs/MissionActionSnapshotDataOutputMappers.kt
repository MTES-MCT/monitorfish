package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlResource
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionReporting
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionReportingThreat
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionVesselGroup
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.MissionActionControlResourceDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.MissionActionControlUnitDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.MissionActionReportingDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.MissionActionReportingThreatDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.MissionActionVesselGroupDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.utils.toContract

fun MissionActionVesselGroup.toMissionActionVesselGroupDataOutput() =
    MissionActionVesselGroupDataOutput(
        id = id,
        name = name,
        color = color,
        type = type.toContract(),
        isPriorityGroup = isPriorityGroup,
    )

fun MissionActionReporting.toMissionActionReportingDataOutput() =
    MissionActionReportingDataOutput(
        id = id,
        type = type.toContract(),
        title = title,
        threats = threats.map { it.toMissionActionReportingThreatDataOutput() },
    )

fun MissionActionReportingThreat.toMissionActionReportingThreatDataOutput() =
    MissionActionReportingThreatDataOutput(
        natinfCode = natinfCode,
        threat = threat,
        threatCharacterization = threatCharacterization,
    )

fun LegacyControlUnit.toMissionActionControlUnitDataOutput() =
    MissionActionControlUnitDataOutput(
        id = id,
        administration = administration,
        isArchived = isArchived,
        name = name,
        resources = resources.map { it.toMissionActionControlResourceDataOutput() },
        contact = contact,
    )

fun ControlResource.toMissionActionControlResourceDataOutput() =
    MissionActionControlResourceDataOutput(
        id = id,
        name = name,
        type = type.toContract(),
    )
