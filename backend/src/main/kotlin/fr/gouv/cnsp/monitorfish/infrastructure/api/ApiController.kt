package fr.gouv.cnsp.monitorfish.infrastructure.api

import fr.gouv.cnsp.monitorfish.domain.use_cases.ParseAndSavePosition
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import io.swagger.annotations.ApiParam
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
@Api(description = "External API")
class ApiController(
        private val parseAndSavePosition: ParseAndSavePosition) {

    @PostMapping(value = ["/v1/positions"])
    @ApiOperation("Receive position")
    @ResponseStatus(HttpStatus.CREATED)
    fun postPosition(
            @ApiParam("VMS NAF", required = true)
            @RequestBody naf: String
    ) {
        parseAndSavePosition.execute(naf)
    }
}
