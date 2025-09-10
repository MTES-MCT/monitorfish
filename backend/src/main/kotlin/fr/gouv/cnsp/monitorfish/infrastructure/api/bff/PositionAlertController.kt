package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.GetPositionAlerts
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.PositionAlertDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/position_alerts_specs")
@Tag(name = "APIs for position alerts specification")
class PositionAlertController(
    private val getPositionAlerts: GetPositionAlerts,
) {
    @GetMapping("")
    @Operation(summary = "Get all position alerts specifications")
    fun getOperationalAlerts(): List<PositionAlertDataOutput> =
        getPositionAlerts.execute().map {
            PositionAlertDataOutput.fromPositionAlert(it)
        }
}
