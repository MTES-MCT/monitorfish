package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.GearDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.SpeciesAndSpeciesGroupsDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.referential.ReferentialSnapshots
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

const val REFERENTIAL_VERSION_PARAMETER_DESCRIPTION =
    "Version of the referential (see `/bff/v1/referentials/versions`): the response is cached by the browser when it is the current one"

@RestController
@RequestMapping("/bff")
@Tag(name = "APIs for Data referential")
class DataReferentialController(
    private val referentialSnapshots: ReferentialSnapshots,
) {
    @GetMapping("/v1/gears")
    @Operation(summary = "Get FAO fishing gear codes")
    fun getGears(
        @Parameter(description = REFERENTIAL_VERSION_PARAMETER_DESCRIPTION)
        @RequestParam(name = "v", required = false)
        version: String?,
    ): ResponseEntity<List<GearDataOutput>> = referentialSnapshots.gears().toResponse(version)

    @GetMapping("/v1/species")
    @Operation(summary = "Get FAO species codes and groups")
    fun getSpecies(
        @Parameter(description = REFERENTIAL_VERSION_PARAMETER_DESCRIPTION)
        @RequestParam(name = "v", required = false)
        version: String?,
    ): ResponseEntity<SpeciesAndSpeciesGroupsDataOutput> = referentialSnapshots.species().toResponse(version)
}
