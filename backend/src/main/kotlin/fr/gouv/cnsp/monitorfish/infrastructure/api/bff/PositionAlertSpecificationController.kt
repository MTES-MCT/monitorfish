package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.ActivateOrDeactivateAlertSpecification
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.DeleteAlertSpecification
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.GetPositionAlertSpecifications
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.PositionAlertSpecificationDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/bff/v1/position_alerts_specs")
@Tag(name = "APIs for position alerts specification")
class PositionAlertSpecificationController(
    private val getPositionAlertSpecifications: GetPositionAlertSpecifications,
    private val activateOrDeactivateAlertSpecification: ActivateOrDeactivateAlertSpecification,
    private val deleteAlertSpecification: DeleteAlertSpecification,
) {
    @GetMapping("")
    @Operation(summary = "Get all position alerts specifications")
    fun getPositionAlert(): List<PositionAlertSpecificationDataOutput> =
        getPositionAlertSpecifications.execute().map {
            PositionAlertSpecificationDataOutput.fromPositionAlertSpecification(it)
        }

    @PutMapping("/{id}/activate")
    @Operation(summary = "Activate an alert")
    fun activateAlert(
        @PathParam("Alert id")
        @PathVariable(name = "id")
        id: Int,
    ) = activateOrDeactivateAlertSpecification.execute(id = id, isActivated = true)

    @PutMapping("/{id}/deactivate")
    @Operation(summary = "Activate an alert")
    fun deactivateAlert(
        @PathParam("Alert id")
        @PathVariable(name = "id")
        id: Int,
    ) = activateOrDeactivateAlertSpecification.execute(id = id, isActivated = false)

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an alert")
    fun delete(
        @PathParam("Alert id")
        @PathVariable(name = "id")
        id: Int,
    ) = deleteAlertSpecification.execute(id)
}
