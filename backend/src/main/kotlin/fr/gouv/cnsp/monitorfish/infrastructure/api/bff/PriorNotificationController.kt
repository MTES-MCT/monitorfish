package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.GetPriorNotificationTypes
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.GetPriorNotifications
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.PriorNotificationDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.database.filters.LogbookReportFilter
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.ModelAttribute
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/prior-notifications")
@Tag(name = "Prior notifications endpoints")
class PriorNotificationController(
    private val getPriorNotifications: GetPriorNotifications,
    private val getPriorNotificationTypes: GetPriorNotificationTypes,
) {
    @GetMapping("")
    @Operation(summary = "Get all prior notifications")
    fun getAll(
        @ModelAttribute filter: LogbookReportFilter,
    ): List<PriorNotificationDataOutput> {
        return getPriorNotifications.execute(filter).map { PriorNotificationDataOutput.fromPriorNotification(it) }
    }

    @GetMapping("/types")
    @Operation(summary = "Get all prior notification types")
    fun getAll(): List<String> {
        return getPriorNotificationTypes.execute()
    }
}
