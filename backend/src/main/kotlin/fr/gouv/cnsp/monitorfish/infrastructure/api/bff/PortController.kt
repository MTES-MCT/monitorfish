package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.PortDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.referential.ReferentialSnapshots
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/ports")
@Tag(name = "APIs for Ports")
class PortController(
    private val referentialSnapshots: ReferentialSnapshots,
) {
    @GetMapping("")
    @Operation(summary = "Get all active ports")
    fun getActivePorts(
        @Parameter(description = REFERENTIAL_VERSION_PARAMETER_DESCRIPTION)
        @RequestParam(name = "v", required = false)
        version: String?,
    ): ResponseEntity<List<PortDataOutput>> = referentialSnapshots.ports().toResponse(version)
}
