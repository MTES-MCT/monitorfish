package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.ActivateOrDeactivateAlertSpecification
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.AddPositionAlertSpecification
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.DeleteAlertSpecification
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.GetPositionAlertSpecifications
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.UpdatePositionAlertSpecification
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.Utils.getEmail
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.PositionAlertSpecificationDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.PositionAlertSpecificationDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletResponse
import jakarta.websocket.server.PathParam
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/bff/v1/position_alerts_specs")
@Tag(name = "APIs for position alerts specification")
class PositionAlertSpecificationController(
    private val getPositionAlertSpecifications: GetPositionAlertSpecifications,
    private val activateOrDeactivateAlertSpecification: ActivateOrDeactivateAlertSpecification,
    private val deleteAlertSpecification: DeleteAlertSpecification,
    private val addPositionAlertSpecification: AddPositionAlertSpecification,
    private val updatePositionAlertSpecification: UpdatePositionAlertSpecification,
) {
    @GetMapping("")
    @Operation(summary = "Get all position alerts specifications")
    fun getPositionAlert(): List<PositionAlertSpecificationDataOutput> =
        getPositionAlertSpecifications.execute().map {
            PositionAlertSpecificationDataOutput.fromPositionAlertSpecification(it)
        }

    @PostMapping("")
    @Operation(summary = "Create an alert spec")
    fun add(
        response: HttpServletResponse,
        @RequestBody
        positionAlertSpecification: PositionAlertSpecificationDataInput,
    ) {
        val email: String = getEmail(response)

        addPositionAlertSpecification.execute(
            userEmail = email,
            alertSpecification = positionAlertSpecification.toPositionAlertSpecification(),
        )
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an alert spec")
    fun update(
        @PathParam("Alert id")
        @PathVariable(name = "id")
        id: Int,
        @RequestBody
        positionAlertSpecification: PositionAlertSpecificationDataInput,
    ) {
        updatePositionAlertSpecification.execute(
            id = id,
            alertSpecification = positionAlertSpecification.toPositionAlertSpecification(),
        )
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
