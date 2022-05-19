package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.use_cases.CreateFleetSegment
import fr.gouv.cnsp.monitorfish.domain.use_cases.DeleteFleetSegment
import fr.gouv.cnsp.monitorfish.domain.use_cases.GetAllFleetSegments
import fr.gouv.cnsp.monitorfish.domain.use_cases.UpdateFleetSegment
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.CreateOrUpdateFleetSegmentDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.FleetSegmentDataOutput
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import javax.servlet.http.HttpServletRequest

@RestController
@RequestMapping("/bff/v1/fleet_segments")
@Api(description = "APIs for Fleet segments")
class FleetSegmentController(
        private val getAllFleetSegments: GetAllFleetSegments,
        private val updateFleetSegment: UpdateFleetSegment,
        private val deleteFleetSegment: DeleteFleetSegment,
        private val createFleetSegment: CreateFleetSegment) {

    @GetMapping("")
    @ApiOperation("Get fleet segments")
    fun getFleetSegments(): List<FleetSegmentDataOutput> {
        return getAllFleetSegments.execute().map { fleetSegment ->
            FleetSegmentDataOutput.fromFleetSegment(fleetSegment)
        }
    }

    @PutMapping(value = ["/**"], consumes = ["application/json"])
    @ApiOperation("Update a fleet segment")
    fun updateFleetSegment(request: HttpServletRequest,
                           @RequestBody
                           createOrUpdateFleetSegmentData: CreateOrUpdateFleetSegmentDataInput): FleetSegment {
        val segmentPartOfURL = 1
        val segment = request.requestURI.split(request.contextPath + "/fleet_segments/")[segmentPartOfURL]

        return updateFleetSegment.execute(
                segment = segment,
                fields = createOrUpdateFleetSegmentData.toCreateOrUpdateFleetSegmentFields())
    }

    @DeleteMapping(value = ["/**"])
    @ApiOperation("Delete a fleet segment")
    fun deleteFleetSegment(request: HttpServletRequest) {
        val segmentPartOfURL = 1
        val segment = request.requestURI.split(request.contextPath + "/fleet_segments/")[segmentPartOfURL]

        deleteFleetSegment.execute(segment)
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping(value = [""])
    @ApiOperation("Create a fleet segment")
    fun createFleetSegment(@RequestBody
                           newFleetSegmentData: CreateOrUpdateFleetSegmentDataInput) {

        createFleetSegment.execute(newFleetSegmentData.toCreateOrUpdateFleetSegmentFields())
    }
}
