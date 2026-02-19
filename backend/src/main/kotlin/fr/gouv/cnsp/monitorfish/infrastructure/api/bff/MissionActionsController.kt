package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.actrep.JointDeploymentPlan
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.AddMissionActionDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.ActivityReportsDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.ControlsSummaryDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.IsInFrenchEezDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.MissionActionDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import kotlinx.coroutines.runBlocking
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import java.time.ZonedDateTime

@RestController
@RequestMapping("/bff/v1/mission_actions")
@Tag(name = "APIs for mission actions")
class MissionActionsController(
    private val getVesselControls: GetVesselControls,
    private val addMissionAction: AddMissionAction,
    private val updateMissionAction: UpdateMissionAction,
    private val deleteMissionAction: DeleteMissionAction,
    private val getActivityReports: GetActivityReports,
    private val isPointInFrenchEez: IsPointInFrenchEez,
) {
    @GetMapping("/controls")
    @Operation(summary = "Get vessel's controls")
    fun getVesselControls(
        @Parameter(description = "Vessel id")
        @RequestParam(name = "vesselId")
        vesselId: Int,
        @Parameter(description = "actions after date time")
        @RequestParam(name = "afterDateTime")
        @DateTimeFormat(pattern = VesselController.zoneDateTimePattern)
        afterDateTime: ZonedDateTime,
    ): ControlsSummaryDataOutput =
        runBlocking {
            val actionsSummary = getVesselControls.execute(vesselId, afterDateTime)
            ControlsSummaryDataOutput.fromControlsSummary(actionsSummary)
        }

    @GetMapping("/controls/activity_reports")
    @Operation(summary = "Get vessels activity reports (ACT-REP)")
    fun getActivityReports(
        @Parameter(description = "actions before date time")
        @RequestParam(name = "beforeDateTime")
        @DateTimeFormat(pattern = VesselController.zoneDateTimePattern)
        beforeDateTime: ZonedDateTime,
        @Parameter(description = "actions after date time")
        @RequestParam(name = "afterDateTime")
        @DateTimeFormat(pattern = VesselController.zoneDateTimePattern)
        afterDateTime: ZonedDateTime,
        @Parameter(description = "JDP")
        @RequestParam(name = "jdp")
        jdp: JointDeploymentPlan,
    ): ActivityReportsDataOutput =
        runBlocking {
            val activityReports = getActivityReports.execute(beforeDateTime, afterDateTime, jdp)
            ActivityReportsDataOutput.fromActivityReports(activityReports)
        }

    @PostMapping(value = [""], consumes = ["application/json"])
    @Operation(summary = "Create a mission action")
    @ResponseStatus(HttpStatus.CREATED)
    fun createMissionAction(
        @RequestBody
        actionInput: AddMissionActionDataInput,
    ): MissionActionDataOutput =
        MissionActionDataOutput.fromMissionAction(addMissionAction.execute(actionInput.toMissionAction()))

    @PutMapping(value = ["/{actionId}"], consumes = ["application/json"])
    @Operation(summary = "Update a mission action")
    @ResponseStatus(HttpStatus.CREATED)
    fun updateMissionAction(
        @PathParam("Action id")
        @PathVariable(name = "actionId")
        actionId: Int,
        @RequestBody
        actionInput: AddMissionActionDataInput,
    ): MissionActionDataOutput {
        val updatedMissionAction = updateMissionAction.execute(actionId, actionInput.toMissionAction())
        return MissionActionDataOutput.fromMissionAction(updatedMissionAction)
    }

    @DeleteMapping(value = ["/{actionId}"])
    @Operation(summary = "Delete a mission action")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteMissionAction(
        @PathParam("Action id")
        @PathVariable(name = "actionId")
        actionId: Int,
    ) = deleteMissionAction.execute(actionId)

    @GetMapping("/is-in-french-eez")
    @Operation(summary = "Check if a coordinate is inside the Metropolitan French EEZ")
    fun isInFrenchEez(
        @Parameter(description = "Latitude")
        @RequestParam(name = "latitude")
        latitude: Double,
        @Parameter(description = "Longitude")
        @RequestParam(name = "longitude")
        longitude: Double,
    ): IsInFrenchEezDataOutput =
        IsInFrenchEezDataOutput(isInFrenchEez = isPointInFrenchEez.execute(latitude, longitude))
}
