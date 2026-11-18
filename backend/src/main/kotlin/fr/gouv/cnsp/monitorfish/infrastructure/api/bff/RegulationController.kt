package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.infrastructure.api.referential.ReferentialSnapshots
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/regulations")
@Tag(name = "APIs for Regulations")
class RegulationController(
    private val referentialSnapshots: ReferentialSnapshots,
) {
    @GetMapping("/catalogue", produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(
        summary = "Get the regulatory zones without their geometry, as the GeoServer layer `monitorfish:regulations`",
    )
    fun getCatalogue(
        @Parameter(description = REFERENTIAL_VERSION_PARAMETER_DESCRIPTION)
        @RequestParam(name = "v", required = false)
        version: String?,
    ): ResponseEntity<String> = referentialSnapshots.regulations().toResponse(version)
}
