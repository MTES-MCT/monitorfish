package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.SilenceOperationalAlertDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.SilencedAlertDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.PendingAlertDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.SilencedAlertDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/bff/v1/operational_alerts")
@Tag(name = "APIs for pending Operational alerts")
class PendingAlertController(
    private val getPendingAlerts: GetPendingAlerts,
    private val validatePendingAlert: ValidatePendingAlert,
    private val silencePendingAlert: SilencePendingAlert,
    private val getSilencedAlerts: GetSilencedAlerts,
    private val deleteSilencedAlert: DeleteSilencedAlert,
    private val silenceAlert: SilenceAlert,
    private val objectMapper: ObjectMapper,
) {

    @GetMapping("")
    @Operation(summary = "Get pending operational alerts")
    fun getOperationalAlerts(): List<PendingAlertDataOutput> {
        return getPendingAlerts.execute().map {
            PendingAlertDataOutput.fromPendingAlert(it)
        }
    }

    @PutMapping(value = ["/{id}/validate"])
    @Operation(summary = "Validate a pending operational alert")
    fun validateAlert(
        @PathParam("Alert id")
        @PathVariable(name = "id")
        id: Int,
    ) {
        return validatePendingAlert.execute(id)
    }

    @PutMapping(value = ["/{id}/silence"], consumes = ["application/json"])
    @Operation(summary = "Silence a pending operational alert")
    fun silenceAlert(
        @PathParam("Alert id")
        @PathVariable(name = "id")
        id: Int,
        @RequestBody
        silenceOperationalAlertData: SilenceOperationalAlertDataInput,
    ): SilencedAlertDataOutput {
        val silencedAlert = silencePendingAlert.execute(
            id,
            silenceOperationalAlertData.silencedAlertPeriod,
            silenceOperationalAlertData.beforeDateTime,
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
        id: Int,
    ) {
        return deleteSilencedAlert.execute(id)
    }

    @PostMapping(value = ["/silenced"], consumes = ["application/json"])
    @Operation(summary = "Silence an operational alert")
    fun silenceAlert(
        @RequestBody
        silenceAlertData: SilencedAlertDataInput,
    ): SilencedAlertDataOutput {
        val silencedAlert = silenceAlert.execute(silenceAlertData.toSilencedAlert(objectMapper))

        return SilencedAlertDataOutput.fromSilencedAlert(silencedAlert)
    }
}
