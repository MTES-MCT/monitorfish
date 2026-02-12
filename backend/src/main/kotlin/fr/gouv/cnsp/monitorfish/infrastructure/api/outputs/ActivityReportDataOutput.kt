package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.actrep.ActivityCode
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.dtos.ActivityReport
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.dtos.ActivityReportInfraction

data class ActivityReportDataOutput(
    val action: MissionActionDataOutput,
    val activityCode: ActivityCode,
    val faoArea: String?,
    val segment: String?,
    val vesselNationalIdentifier: String,
    val controlUnits: List<LegacyControlUnit>,
    val vessel: SelectedVesselDataOutput,
    val infractions: List<ActivityReportInfractionDataOutput>,
) {
    companion object {
        fun fromActivityReport(activityReport: ActivityReport) =
            ActivityReportDataOutput(
                action =
                    MissionActionDataOutput.fromMissionAction(
                        missionAction = activityReport.action,
                        useThreatHierarchyForForm = false,
                    ),
                activityCode = activityReport.activityCode,
                faoArea = activityReport.faoArea,
                segment = activityReport.segment,
                vesselNationalIdentifier = activityReport.vesselNationalIdentifier,
                controlUnits = activityReport.controlUnits,
                vessel = SelectedVesselDataOutput.fromVessel(activityReport.vessel),
                infractions =
                    activityReport.infractions.map {
                        ActivityReportInfractionDataOutput.fromActivityReportInfraction(it)
                    },
            )
    }
}

data class ActivityReportInfractionDataOutput(
    val isrCode: String?,
    val isrName: String?,
) {
    companion object {
        fun fromActivityReportInfraction(
            activityReportInfraction: ActivityReportInfraction,
        ): ActivityReportInfractionDataOutput =
            ActivityReportInfractionDataOutput(
                isrCode = activityReportInfraction.isrCode,
                isrName = activityReportInfraction.isrName,
            )
    }
}
