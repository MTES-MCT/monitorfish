package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllControlUnits
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.PublicControlUnitDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/control_units")
@Tag(name = "Public APIs for control units")
class PublicControlUnitController(
    private val getAllControlUnits: GetAllControlUnits,
) {
    @GetMapping("")
    @Operation(summary = "Get all control units, with their contacts")
    fun getAllControlUnits(): List<PublicControlUnitDataOutput> =
        getAllControlUnits.execute().map {
            PublicControlUnitDataOutput.fromFullControlUnit(it)
        }
}
