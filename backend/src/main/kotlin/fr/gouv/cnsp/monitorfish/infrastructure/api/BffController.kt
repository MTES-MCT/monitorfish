package fr.gouv.cnsp.monitorfish.infrastructure.api

import fr.gouv.cnsp.monitorfish.domain.use_cases.GetAllGears
import fr.gouv.cnsp.monitorfish.domain.use_cases.GetLastPositions
import fr.gouv.cnsp.monitorfish.domain.use_cases.GetVessel
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.GearDataOutput
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
        private val getVessel: GetVessel,
        private val getAllGears: GetAllGears) {

    @GetMapping("/v1/vessels")
    @ApiOperation("Get all vessels' last position")
    fun getPositions(): List<PositionDataOutput> {
        return getLastPositions.execute().map { position ->
            position.let {
                PositionDataOutput.fromPosition(position)
            }
        }
    }

    @GetMapping("/v1/vessels/search")
    @ApiOperation("Get vessel's last positions and data")
    fun getPosition(@ApiParam("Vessel internal reference number (CFR)", required = false)
                    @RequestParam(name = "internalReferenceNumber")
                    internalReferenceNumber: String,
                    @ApiParam("Vessel external reference number", required = false)
                    @RequestParam(name = "externalReferenceNumber")
                    externalReferenceNumber: String,
                    @ApiParam("Vessel IRCS", required = false)
                    @RequestParam(name = "IRCS")
                    IRCS: String): VesselDataOutput {
        return runBlocking {
            val (vessel, positions) = getVessel.execute(internalReferenceNumber, externalReferenceNumber, IRCS)

            VesselDataOutput.fromVessel(vessel, positions)
        }
    }

    @GetMapping("/v1/gears")
    @ApiOperation("Get FAO fishing gear codes")
    fun getGears(): List<GearDataOutput> {
        return getAllGears.execute().map { gear ->
            gear.let {
                GearDataOutput.fromGear(gear)
            }
        }
    }
}
