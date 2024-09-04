package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.fao_areas.ComputeVesselFaoAreas
import fr.gouv.cnsp.monitorfish.domain.use_cases.fao_areas.GetFaoAreas
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff")
@Tag(name = "APIs for Data referential")
class FaoAreaController(
    private val getFAOAreas: GetFaoAreas,
    private val computeVesselFAOAreas: ComputeVesselFaoAreas,
) {
    @GetMapping("/v1/fao_areas")
    @Operation(summary = "Get FAO areas")
    fun getFAOAreas(): List<String> {
        return getFAOAreas.execute()
    }

    @GetMapping("/v1/fao_areas/compute")
    @Operation(summary = "Get FAO areas")
    fun getFAOAreas(
        @Parameter(description = "Internal reference number")
        @RequestParam(name = "internalReferenceNumber")
        internalReferenceNumber: String?,
        @Parameter(description = "Latitude")
        @RequestParam(name = "latitude")
        latitude: Double?,
        @Parameter(description = "Longitude")
        @RequestParam(name = "longitude")
        longitude: Double?,
        @Parameter(description = "Port Locode")
        @RequestParam(name = "portLocode")
        portLocode: String?,
    ): List<String> {
        return computeVesselFAOAreas.execute(internalReferenceNumber, latitude, longitude, portLocode)
    }
}
