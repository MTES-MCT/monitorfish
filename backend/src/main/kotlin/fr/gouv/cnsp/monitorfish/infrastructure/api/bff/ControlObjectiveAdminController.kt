package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.control_objective.AddControlObjective
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_objective.AddControlObjectiveYear
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_objective.DeleteControlObjective
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_objective.GetControlObjectiveYearEntries
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_objective.GetControlObjectivesOfYear
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_objective.UpdateControlObjective
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.AddControlObjectiveDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UpdateControlObjectiveDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.ControlObjectiveDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/admin/control_objectives")
@Tag(name = "APIs for Control objectives")
class ControlObjectiveAdminController(
    private val getControlObjectivesOfYear: GetControlObjectivesOfYear,
    private val getControlObjectiveYearEntries: GetControlObjectiveYearEntries,
    private val addControlObjectiveYear: AddControlObjectiveYear,
    private val updateControlObjective: UpdateControlObjective,
    private val deleteControlObjective: DeleteControlObjective,
    private val addControlObjective: AddControlObjective,
) {
    @GetMapping("/{year}")
    @Operation(summary = "Get control objectives of a given year")
    fun getControlObjectivesOfYear(
        @PathParam("Year")
        @PathVariable(name = "year")
        year: Int,
    ): List<ControlObjectiveDataOutput> =
        getControlObjectivesOfYear.execute(year).map { controlObjective ->
            ControlObjectiveDataOutput.fromControlObjective(controlObjective)
        }

    @GetMapping("/years")
    @Operation(summary = "Get control objective year entries")
    fun getControlObjectiveYearEntries(): List<Int> = getControlObjectiveYearEntries.execute()

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/years")
    @Operation(summary = "Add a control objective year")
    fun addControlObjectiveYear() = addControlObjectiveYear.execute()

    @PutMapping(value = ["/{controlObjectiveId}"], consumes = ["application/json"])
    @Operation(summary = "Update a control objective")
    fun updateControlObjective(
        @PathParam("Control objective id")
        @PathVariable(name = "controlObjectiveId")
        controlObjectiveId: Int,
        @RequestBody
        updateControlObjectiveData: UpdateControlObjectiveDataInput,
    ) {
        updateControlObjective.execute(
            id = controlObjectiveId,
            targetNumberOfControlsAtSea = updateControlObjectiveData.targetNumberOfControlsAtSea,
            targetNumberOfControlsAtPort = updateControlObjectiveData.targetNumberOfControlsAtPort,
            controlPriorityLevel = updateControlObjectiveData.controlPriorityLevel,
            infringementRiskLevel = updateControlObjectiveData.infringementRiskLevel,
        )
    }

    @DeleteMapping(value = ["/{controlObjectiveId}"])
    @Operation(summary = "Delete a control objective")
    fun deleteControlObjective(
        @PathParam("Control objective id")
        @PathVariable(name = "controlObjectiveId")
        controlObjectiveId: Int,
    ) {
        deleteControlObjective.execute(controlObjectiveId)
    }

    @PostMapping(value = [""], consumes = ["application/json"])
    @Operation(summary = "Add a control objective")
    fun addControlObjective(
        @RequestBody
        addControlObjectiveData: AddControlObjectiveDataInput,
    ): Int =
        addControlObjective.execute(
            segment = addControlObjectiveData.segment,
            facade = addControlObjectiveData.facade,
            year = addControlObjectiveData.year,
        )
}
