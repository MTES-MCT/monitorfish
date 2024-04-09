package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.GetPriorNotification
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.GetPriorNotifications
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.LogbookReportFilterDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.PriorNotificationDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.PriorNotificationDetailDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/bff/v1/prior_notifications")
@Tag(name = "Prior notifications endpoints")
class PriorNotificationController(
    private val getPriorNotification: GetPriorNotification,
    private val getPriorNotifications: GetPriorNotifications,
) {
    @GetMapping("")
    @Operation(summary = "Get all prior notifications")
    fun getAll(
        @ModelAttribute filter: LogbookReportFilterDataInput,
    ): List<PriorNotificationDataOutput> {
        return getPriorNotifications.execute(filter.toLogbookReportFilter()).mapNotNull {
            PriorNotificationDataOutput.fromPriorNotification(it)
        }
    }

    @GetMapping("/{logbookMessageReportId}")
    @Operation(summary = "Get a prior notification by its (logbook message) `reportId`")
    fun getOne(
        @PathParam("Logbook message `reportId`")
        @PathVariable(name = "logbookMessageReportId")
        logbookMessageReportId: String,
    ): PriorNotificationDetailDataOutput {
        return PriorNotificationDetailDataOutput.fromPriorNotification(
            getPriorNotification.execute(logbookMessageReportId),
        )
    }
}
