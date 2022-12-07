package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.CreateOrUpdateFleetSegmentDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.FleetSegmentDataOutput
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import io.swagger.annotations.ApiParam
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import javax.websocket.server.PathParam

@RestController
@RequestMapping("/bff/v1/fleet_segments")
@Api(description = "APIs for Fleet segments")
class FleetSegmentController(
    private val getAllFleetSegmentsByYearByYear: GetAllFleetSegmentsByYear,
    private val updateFleetSegment: UpdateFleetSegment,
    private val deleteFleetSegment: DeleteFleetSegment,
    private val createFleetSegment: CreateFleetSegment,
    private val getFleetSegmentYearEntries: GetFleetSegmentYearEntries,
    private val addFleetSegmentYear: AddFleetSegmentYear
) {

    @GetMapping("/{year}")
    @ApiOperation("Get fleet segments")
    fun getFleetSegments(
        @PathParam("Year")
        @PathVariable(name = "year")
        year: Int
    ): List<FleetSegmentDataOutput> {
        return getAllFleetSegmentsByYearByYear.execute(year).map { fleetSegment ->
            FleetSegmentDataOutput.fromFleetSegment(fleetSegment)
        }
    }

    @PutMapping(value = [""], consumes = ["application/json"])
    @ApiOperation("Update a fleet segment")
    fun updateFleetSegment(
        @ApiParam("Year")
        @RequestParam(name = "year")
        year: Int,
        @ApiParam("Segment")
        @RequestParam(name = "segment")
        segment: String,
        @RequestBody
        createOrUpdateFleetSegmentData: CreateOrUpdateFleetSegmentDataInput
    ): FleetSegmentDataOutput {
        val updatedFleetSegment = updateFleetSegment.execute(
            segment = segment,
            fields = createOrUpdateFleetSegmentData.toCreateOrUpdateFleetSegmentFields(),
            year = year
        )

        return FleetSegmentDataOutput.fromFleetSegment(updatedFleetSegment)
    }

    @DeleteMapping(value = [""])
    @ApiOperation("Delete a fleet segment")
    fun deleteFleetSegment(
        @ApiParam("Year")
        @RequestParam(name = "year")
        year: Int,
        @ApiParam("Segment")
        @RequestParam(name = "segment")
        segment: String
    ): List<FleetSegmentDataOutput> {
        return deleteFleetSegment.execute(segment, year).map {
            FleetSegmentDataOutput.fromFleetSegment(it)
        }
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping(value = [""])
    @ApiOperation("Create a fleet segment")
    fun createFleetSegment(
        @RequestBody
        newFleetSegmentData: CreateOrUpdateFleetSegmentDataInput
    ): FleetSegmentDataOutput {
        val createdFleetSegment = createFleetSegment.execute(newFleetSegmentData.toCreateOrUpdateFleetSegmentFields())

        return FleetSegmentDataOutput.fromFleetSegment(createdFleetSegment)
    }

    @GetMapping("/years")
    @ApiOperation("Get fleet segment year entries")
    fun getFleetSegmentYearEntries(): List<Int> {
        return getFleetSegmentYearEntries.execute()
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/{year}")
    @ApiOperation("Add a fleet segment year")
    fun addFleetSegmentYear(
        @PathParam("Year")
        @PathVariable(name = "year")
        year: Int
    ) {
        return addFleetSegmentYear.execute(year)
    }
}
