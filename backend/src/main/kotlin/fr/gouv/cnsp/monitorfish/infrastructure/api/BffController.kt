package fr.gouv.cnsp.monitorfish.infrastructure.api

import fr.gouv.cnsp.monitorfish.domain.use_cases.GetAllPositions
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.PositionDataOutput
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/bff")
@Api(description = "API for UI frontend")
class BffController(
        private val getAllPositions: GetAllPositions) {

    @GetMapping("/v1/positions")
    @ApiOperation("Get all positions")
    fun getPositions(): List<PositionDataOutput> {
        return getAllPositions.execute().map { position ->
            PositionDataOutput.fromPosition(position)
        }
    }
}
