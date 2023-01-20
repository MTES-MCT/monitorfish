package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions.AddMissionAction
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions.GetVesselMissionActions
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.AddMissionActionDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.MissionActionDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.MissionActionsSummaryDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import kotlinx.coroutines.runBlocking
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import java.time.ZonedDateTime

@RestController
@RequestMapping("/bff/v1/mission_actions")
@Tag(name = "APIs for mission actions")
class MissionActionsController(
    private val getVesselMissionActions: GetVesselMissionActions,
    private val addMissionAction: AddMissionAction,
    private val mapper: ObjectMapper
) {

    @GetMapping("")
    @Operation(summary = "Get vessel's mission actions")
    fun getVesselMissionActions(
        @Parameter(description = "Vessel id")
        @RequestParam(name = "vesselId")
        vesselId: Int,
        @Parameter(description = "actions after date time")
        @RequestParam(name = "afterDateTime")
        @DateTimeFormat(pattern = VesselController.zoneDateTimePattern)
        afterDateTime: ZonedDateTime
    ): MissionActionsSummaryDataOutput {
        return runBlocking {
            val actionsSummary = getVesselMissionActions.execute(vesselId, afterDateTime)

            MissionActionsSummaryDataOutput.fromMissionActionsSummary(actionsSummary)
        }
    }

    @PostMapping(value = [""], consumes = ["application/json"])
    @Operation(summary = "Create a mission action")
    @ResponseStatus(HttpStatus.CREATED)
    fun createMissionAction(
        @RequestBody
        actionInput: AddMissionActionDataInput
    ): MissionActionDataOutput {
        return MissionActionDataOutput.fromMissionAction(addMissionAction.execute(actionInput.toMissionAction(mapper)))
    }
}
