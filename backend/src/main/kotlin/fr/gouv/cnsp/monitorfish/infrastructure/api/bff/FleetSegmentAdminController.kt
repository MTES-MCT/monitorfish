package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.AddFleetSegmentYear
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.CreateFleetSegment
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.DeleteFleetSegment
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.GetFleetSegmentYearEntries
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.UpdateFleetSegment
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.CreateOrUpdateFleetSegmentDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.FleetSegmentDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/admin/fleet_segments")
@Tag(name = "APIs for administration of Fleet segments")
class FleetSegmentAdminController(
    private val updateFleetSegment: UpdateFleetSegment,
    private val deleteFleetSegment: DeleteFleetSegment,
    private val createFleetSegment: CreateFleetSegment,
    private val getFleetSegmentYearEntries: GetFleetSegmentYearEntries,
    private val addFleetSegmentYear: AddFleetSegmentYear,
) {
    @PutMapping(value = [""], consumes = ["application/json"])
    @Operation(summary = "Update a fleet segment")
    fun updateFleetSegment(
        @Parameter(description = "Segment")
        @RequestParam(name = "segment")
        segment: String,
        @RequestBody
        createOrUpdateFleetSegmentData: CreateOrUpdateFleetSegmentDataInput,
    ): FleetSegmentDataOutput {
        val updatedFleetSegment =
            updateFleetSegment.execute(
                segment = segment,
                updatedSegment = createOrUpdateFleetSegmentData.toFleetSegment(),
            )

        return FleetSegmentDataOutput.fromFleetSegment(updatedFleetSegment)
    }

    @DeleteMapping(value = [""])
    @Operation(summary = "Delete a fleet segment")
    fun deleteFleetSegment(
        @Parameter(description = "Year")
        @RequestParam(name = "year")
        year: Int,
        @Parameter(description = "Segment")
        @RequestParam(name = "segment")
        segment: String,
    ): List<FleetSegmentDataOutput> =
        deleteFleetSegment.execute(segment, year).map {
            FleetSegmentDataOutput.fromFleetSegment(it)
        }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping(value = [""])
    @Operation(summary = "Create a fleet segment")
    fun createFleetSegment(
        @RequestBody
        newFleetSegmentData: CreateOrUpdateFleetSegmentDataInput,
    ): FleetSegmentDataOutput {
        val createdFleetSegment = createFleetSegment.execute(newFleetSegmentData.toFleetSegment())

        return FleetSegmentDataOutput.fromFleetSegment(createdFleetSegment)
    }

    @GetMapping("/years")
    @Operation(summary = "Get fleet segment year entries")
    fun getFleetSegmentYearEntries(): List<Int> = getFleetSegmentYearEntries.execute()

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/{year}")
    @Operation(summary = "Add a fleet segment year")
    fun addFleetSegmentYear(
        @PathParam("Year")
        @PathVariable(name = "year")
        year: Int,
    ) = addFleetSegmentYear.execute(year)
}
