package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.ComputeFleetSegments
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.GetAllFleetSegmentsByYear
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.FleetSegmentDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/bff/v1/fleet_segments")
@Tag(name = "APIs for Fleet segments")
class FleetSegmentController(
    private val getAllFleetSegmentsByYearByYear: GetAllFleetSegmentsByYear,
    private val computeFleetSegments: ComputeFleetSegments,
) {
    @GetMapping("/{year}")
    @Operation(summary = "Get fleet segments")
    fun getFleetSegments(
        @PathParam("Year")
        @PathVariable(name = "year")
        year: Int,
    ): List<FleetSegmentDataOutput> {
        return getAllFleetSegmentsByYearByYear.execute(year).map { fleetSegment ->
            FleetSegmentDataOutput.fromFleetSegment(fleetSegment)
        }
    }

    @GetMapping("/compute")
    @Operation(summary = "compute fleet segments for the current year")
    fun computeFleetSegments(
        @Parameter(description = "Year")
        @RequestParam(name = "faoAreas")
        faoAreas: List<String>,
        @Parameter(description = "Gears")
        @RequestParam(name = "gears")
        gears: List<String>,
        @Parameter(description = "Species")
        @RequestParam(name = "species")
        species: List<String>,
    ): List<FleetSegmentDataOutput> {
        val fleetSegments = computeFleetSegments.execute(faoAreas, gears, species)

        return fleetSegments.map {
            FleetSegmentDataOutput.fromFleetSegment(it)
        }
    }
}
