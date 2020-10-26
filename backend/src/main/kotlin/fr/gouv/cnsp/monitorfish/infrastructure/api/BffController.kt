package fr.gouv.cnsp.monitorfish.infrastructure.api

import fr.gouv.cnsp.monitorfish.domain.use_cases.GetLastPositions
import fr.gouv.cnsp.monitorfish.domain.use_cases.GetShipLastPositions
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.PositionDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.PositionsDataOutput
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import io.swagger.annotations.ApiParam
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/bff")
@Api(description = "API for UI frontend")
class BffController(
        private val getLastPositions: GetLastPositions,
        private val getShipPositions: GetShipLastPositions) {

    @GetMapping("/v1/positions")
    @ApiOperation("Get all positions")
    fun getPositions(): List<PositionDataOutput> {
        return getLastPositions.execute().map { position ->
            PositionDataOutput.fromPosition(position)
        }
    }

    @GetMapping("/v1/positions/{internalReferenceNumber}")
    @ApiOperation("Get ship's last position")
    fun getPosition(@ApiParam("Ship internal reference number (CFR)", required = true)
                    @PathVariable(name = "internalReferenceNumber")
                    internalReferenceNumber: String): PositionsDataOutput {
        return PositionsDataOutput.fromPositions(getShipPositions.execute(internalReferenceNumber))
    }
}
