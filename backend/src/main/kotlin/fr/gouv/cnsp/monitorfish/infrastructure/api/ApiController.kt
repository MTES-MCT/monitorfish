package fr.gouv.cnsp.monitorfish.infrastructure.api

import fr.gouv.cnsp.monitorfish.domain.use_cases.ReceivePosition
import fr.gouv.cnsp.monitorfish.infrastructure.api.inputs.NAFPositionDataInput
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import io.swagger.annotations.ApiParam
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
@Api(description = "External API")
class ApiController(
        private val receivePosition: ReceivePosition) {

    private val logger: Logger = LoggerFactory.getLogger(ApiController::class.java)

    @PostMapping(value = ["/v1/positions"])
    @ApiOperation("Receive position")
    @ResponseStatus(HttpStatus.CREATED)
    fun receivePosition(
            @ApiParam("VMS NAF", required = true)
            @RequestBody naf: String
    ) {
        val positionDataInput = NAFPositionDataInput(naf)
        receivePosition.execute(positionDataInput.toPosition())
    }
}
