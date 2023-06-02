package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.ParseAndSavePosition
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
@Tag(name = "External API")
class PositionsController(
    private val parseAndSavePosition: ParseAndSavePosition,
) {

    @PostMapping(value = ["/v1/positions"])
    @Operation(summary = "Receive position")
    @ResponseStatus(HttpStatus.CREATED)
    fun postPosition(
        @Parameter(description = "VMS NAF", required = true)
        @RequestBody
        naf: String,
    ) {
        parseAndSavePosition.execute(naf)
    }
}
