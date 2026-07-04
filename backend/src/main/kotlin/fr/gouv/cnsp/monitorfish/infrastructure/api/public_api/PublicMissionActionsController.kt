package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.EnrichPublicMissionAction
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.GetMissionActions
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.PatchMissionAction
import fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.input.PatchableMissionActionDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.outputs.PublicMissionActionDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/mission_actions")
@Tag(name = "APIs for mission actions")
class PublicMissionActionsController(
    private val getMissionActions: GetMissionActions,
    private val patchMissionAction: PatchMissionAction,
    private val enrichPublicMissionAction: EnrichPublicMissionAction,
) {
    @GetMapping("")
    @Operation(summary = "Get mission actions of specified mission")
    fun getMissionActions(
        @Parameter(description = "Mission id")
        @RequestParam(name = "missionId")
        missionId: Int,
    ): List<PublicMissionActionDataOutput> =
        getMissionActions.execute(missionId).map {
            PublicMissionActionDataOutput.fromEnriched(enrichPublicMissionAction.execute(it))
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
    ): PublicMissionActionDataOutput {
        val updatedMissionAction = patchMissionAction.execute(actionId, actionInput.toPatchableMissionAction())

        return PublicMissionActionDataOutput.fromEnriched(enrichPublicMissionAction.execute(updatedMissionAction))
    }
}
