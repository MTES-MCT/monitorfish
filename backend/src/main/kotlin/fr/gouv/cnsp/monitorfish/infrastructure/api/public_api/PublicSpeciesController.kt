package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.domain.use_cases.species.GetAllSpecies
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.SpeciesDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.toSpeciesDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/species")
@Tag(name = "Public APIs for species")
class PublicSpeciesController(
    private val getAllSpecies: GetAllSpecies,
) {
    @GetMapping("")
    @Operation(summary = "Get FAO species codes")
    fun getAllSpecies(): List<SpeciesDataOutput> = getAllSpecies.execute().map { it.toSpeciesDataOutput() }
}
