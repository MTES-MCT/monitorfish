package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions.GetMissionActions
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.MissionActionDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/mission_actions")
@Tag(name = "APIs for mission actions")
class PublicMissionActionsController(
    private val getMissionActions: GetMissionActions,
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
}
