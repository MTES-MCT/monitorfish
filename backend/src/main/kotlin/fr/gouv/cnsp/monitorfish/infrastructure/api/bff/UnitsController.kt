package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.controller.GetAllControllers
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.ControllerDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/controllers")
@Tag(name = "APIs for Controllers (Units)")
class UnitsController(private val getAllControllers: GetAllControllers) {

    @GetMapping("")
    @Operation(summary = "Get all controllers")
    fun getAllControllers(): List<ControllerDataOutput> {
        return getAllControllers.execute().map { controller ->
            ControllerDataOutput.fromController(controller)
        }
    }
}
