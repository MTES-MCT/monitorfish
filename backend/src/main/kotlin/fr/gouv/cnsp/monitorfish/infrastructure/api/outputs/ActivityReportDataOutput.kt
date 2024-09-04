package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.actrep.ActivityCode
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.dtos.ActivityReport

data class ActivityReportDataOutput(
    val action: MissionActionDataOutput,
    val activityCode: ActivityCode,
    val faoArea: String?,
    val segment: String?,
    val vesselNationalIdentifier: String,
    val controlUnits: List<ControlUnit>,
    val vessel: VesselDataOutput,
) {
    companion object {
        fun fromActivityReport(activityReport: ActivityReport) =
            ActivityReportDataOutput(
                action = MissionActionDataOutput.fromMissionAction(activityReport.action),
                activityCode = activityReport.activityCode,
                faoArea = activityReport.faoArea,
                segment = activityReport.segment,
                vesselNationalIdentifier = activityReport.vesselNationalIdentifier,
                controlUnits = activityReport.controlUnits,
                vessel = VesselDataOutput.fromVessel(activityReport.vessel),
            )
    }
}
