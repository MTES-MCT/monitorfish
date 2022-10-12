package fr.gouv.cnsp.monitorfish.infrastructure.api

import fr.gouv.cnsp.monitorfish.domain.use_cases.healthcheck.GetHealthcheck
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.HealthDataOutput
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/healthcheck")
@Api(description = "API for Healthcheck")
class HealthcheckController(
    private val getHealthcheck: GetHealthcheck
) {

    @GetMapping("")
    @ApiOperation("Get healtcheck of positions and logbook")
    fun getHealthcheck(): HealthDataOutput {
        return HealthDataOutput.fromHealth(getHealthcheck.execute())
    }
}
