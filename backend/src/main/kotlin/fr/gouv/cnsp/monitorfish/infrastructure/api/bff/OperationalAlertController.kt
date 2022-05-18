package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.use_cases.GetOperationalAlerts
import fr.gouv.cnsp.monitorfish.domain.use_cases.ValidateOperationalAlert
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import org.springframework.web.bind.annotation.*
import javax.websocket.server.PathParam

@RestController
@RequestMapping("/bff/v1/operational_alerts")
@Api(description = "APIs for Operational alerts")
class OperationalAlertController(
        private val getOperationalAlerts: GetOperationalAlerts,
        private val validateOperationalAlert: ValidateOperationalAlert) {

    @GetMapping("/")
    @ApiOperation("Get operational alerts")
    fun getOperationalAlerts(): List<PendingAlert> {
        return getOperationalAlerts.execute()
    }

    @PutMapping(value = ["/{id}/validate"])
    @ApiOperation("Validate an operational alert")
    fun getOperationalAlerts(@PathParam("Alert id")
                             @PathVariable(name = "id")
                             id: Int) {
        return validateOperationalAlert.execute(id)
    }

}
