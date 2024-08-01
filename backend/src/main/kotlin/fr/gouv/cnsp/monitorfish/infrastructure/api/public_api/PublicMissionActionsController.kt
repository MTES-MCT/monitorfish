package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.GetMissionActions
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.PatchMissionAction
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.MissionActionDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.input.PatchableMissionActionDataInput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/mission_actions")
@Tag(name = "APIs for mission actions")
class PublicMissionActionsController(
    private val getMissionActions: GetMissionActions,
    private val patchMissionAction: PatchMissionAction,
) {

    @GetMapping("")
    @Operation(summary = "Get mission actions of specified mission")
    fun getMissionActions(
        @Parameter(description = "Mission id")
        @RequestParam(name = "missionId")
        missionId: Int,
    ): List<MissionActionDataOutput> {
        return getMissionActions.execute(missionId).map { MissionActionDataOutput.fromMissionAction(it) }
    }

    @PatchMapping(value = ["/{actionId}"], consumes = ["application/json"])
    @Operation(summary = "Update a mission action")
    @ResponseStatus(HttpStatus.OK)
    fun updateMissionAction(
        @PathParam("Action id")
        @PathVariable(name = "actionId")
        actionId: Int,
        @RequestBody
        actionInput: PatchableMissionActionDataInput,
    ): MissionActionDataOutput {
        val updatedMissionAction = patchMissionAction.execute(actionId, actionInput.toPatchableMissionAction())

        return MissionActionDataOutput.fromMissionAction(updatedMissionAction)
    }
}
