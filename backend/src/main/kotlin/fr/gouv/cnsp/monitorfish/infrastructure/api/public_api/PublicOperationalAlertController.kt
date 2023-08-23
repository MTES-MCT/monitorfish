package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.ValidateOperationalAlert
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/operational_alerts")
@Tag(name = "Public APIs for Operational alerts")
class PublicOperationalAlertController(
    private val validateOperationalAlert: ValidateOperationalAlert,
) {

    @PutMapping(value = ["/{id}/validate"])
    @Operation(summary = "Validate an operational alert")
    fun validateAlert(
        @PathParam("Alert id")
        @PathVariable(name = "id")
        id: Int,
    ) {
        return validateOperationalAlert.execute(id)
    }
}
