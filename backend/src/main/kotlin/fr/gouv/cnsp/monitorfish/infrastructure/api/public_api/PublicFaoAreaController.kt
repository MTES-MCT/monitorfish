package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.domain.use_cases.fao_areas.GetFaoAreas
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/fao_areas")
@Tag(name = "Public APIs for FAO areas")
class PublicFaoAreaController(
    private val getFaoAreas: GetFaoAreas,
) {
    @GetMapping("")
    @Operation(summary = "Get FAO areas codes, sorted by usage")
    fun getFaoAreas(): List<String> = getFaoAreas.execute()
}
