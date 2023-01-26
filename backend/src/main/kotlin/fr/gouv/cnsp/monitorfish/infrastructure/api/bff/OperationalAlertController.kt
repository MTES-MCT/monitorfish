package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.SilenceOperationalAlertDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.PendingAlertDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.SilencedAlertDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.*
import jakarta.websocket.server.PathParam

@RestController
@RequestMapping("/bff/v1/operational_alerts")
@Tag(name = "APIs for Operational alerts")
class OperationalAlertController(
    private val getOperationalAlerts: GetOperationalAlerts,
    private val validateOperationalAlert: ValidateOperationalAlert,
    private val silenceOperationalAlert: SilenceOperationalAlert,
    private val getSilencedAlerts: GetSilencedAlerts,
    private val deleteSilencedOperationalAlert: DeleteSilencedOperationalAlert
) {

    @GetMapping("")
    @Operation(summary = "Get operational alerts")
    fun getOperationalAlerts(): List<PendingAlertDataOutput> {
        return getOperationalAlerts.execute().map {
            PendingAlertDataOutput.fromPendingAlert(it)
        }
    }

    @PutMapping(value = ["/{id}/validate"])
    @Operation(summary = "Validate an operational alert")
    fun validateAlert(
        @PathParam("Alert id")
        @PathVariable(name = "id")
        id: Int
    ) {
        return validateOperationalAlert.execute(id)
    }

    @PutMapping(value = ["/{id}/silence"], consumes = ["application/json"])
    @Operation(summary = "Silence an operational alert")
    fun silenceAlert(
        @PathParam("Alert id")
        @PathVariable(name = "id")
        id: Int,
        @RequestBody
        silenceOperationalAlertData: SilenceOperationalAlertDataInput
    ): SilencedAlertDataOutput {
        val silencedAlert = silenceOperationalAlert.execute(
            id,
            silenceOperationalAlertData.silencedAlertPeriod,
            silenceOperationalAlertData.beforeDateTime
        )

        return SilencedAlertDataOutput.fromSilencedAlert(silencedAlert)
    }

    @GetMapping(value = ["/silenced"])
    @Operation(summary = "Get all silenced operational alert")
    fun getSilencedAlerts(): List<SilencedAlertDataOutput> {
        return getSilencedAlerts.execute().map {
            SilencedAlertDataOutput.fromSilencedAlert(it)
        }
    }

    @DeleteMapping(value = ["/silenced/{id}"])
    @Operation(summary = "Delete a silenced operational alert")
    fun getSilencedAlerts(
        @PathParam("Alert id")
        @PathVariable(name = "id")
        id: Int
    ) {
        return deleteSilencedOperationalAlert.execute(id)
    }
}
