package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.filters.LogbookReportFilter
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.GetPriorNotifications
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.PriorNotificationDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.ModelAttribute
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/prior-notifications")
@Tag(name = "Prior notifications endpoints")
class PriorNotificationController(private val getPriorNotifications: GetPriorNotifications) {
    @GetMapping("")
    @Operation(summary = "Get all prior notifications")
    fun getAll(
        @ModelAttribute filter: LogbookReportFilter,
    ): List<PriorNotificationDataOutput> {
        return getPriorNotifications.execute(filter).map { PriorNotificationDataOutput.fromPriorNotification(it) }
    }
}
