package fr.gouv.cnsp.monitorfish.infrastructure.api

import fr.gouv.cnsp.monitorfish.domain.use_cases.GetLastPositions
import fr.gouv.cnsp.monitorfish.domain.use_cases.GetVessel
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.PositionDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.VesselDataOutput
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import io.swagger.annotations.ApiParam
import kotlinx.coroutines.runBlocking
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/bff")
@Api(description = "API for UI frontend")
class BffController(
        private val getLastPositions: GetLastPositions,
        private val getVessel: GetVessel) {

    @GetMapping("/v1/vessels")
    @ApiOperation("Get all vessels' last position")
    fun getPositions(): List<PositionDataOutput> {
        return getLastPositions.execute().map { position ->
            position.let {
                PositionDataOutput.fromPosition(position)
            }
        }
    }

    @GetMapping("/v1/vessels/{internalReferenceNumber}")
    @ApiOperation("Get vessels's last positions and data")
    fun getPosition(@ApiParam("Vessel internal reference number (CFR)", required = true)
                    @PathVariable(name = "internalReferenceNumber")
                    internalReferenceNumber: String): VesselDataOutput {
        return runBlocking {
            val (vessel, positions) = getVessel.execute(internalReferenceNumber)

            VesselDataOutput.fromVessel(vessel, positions)
        }
    }
}
