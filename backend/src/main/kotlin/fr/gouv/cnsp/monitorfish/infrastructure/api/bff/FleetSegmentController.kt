package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.ComputeFleetSegmentsFromControl
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.GetAllFleetSegmentsByYear
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.ComputeFleetSegmentsDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.FleetSegmentDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/bff/v1/fleet_segments")
@Tag(name = "APIs for Fleet segments")
class FleetSegmentController(
    private val getAllFleetSegmentsByYearByYear: GetAllFleetSegmentsByYear,
    private val computeFleetSegmentsFromControl: ComputeFleetSegmentsFromControl,
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

    @PostMapping("/compute")
    @Operation(summary = "compute fleet segments for the current year")
    fun computeFleetSegments(
        @RequestBody
        computeFleetSegmentsDataInput: ComputeFleetSegmentsDataInput,
    ): List<FleetSegmentDataOutput> {
        val fleetSegments =
            computeFleetSegmentsFromControl.execute(
                computeFleetSegmentsDataInput.vesselId,
                computeFleetSegmentsDataInput.faoAreas,
                computeFleetSegmentsDataInput.gears.map { it.toGearControl() },
                computeFleetSegmentsDataInput.species.map { it.toSpeciesControl() },
            )
        return fleetSegments.map {
            FleetSegmentDataOutput.fromFleetSegment(it)
        }
    }
}
