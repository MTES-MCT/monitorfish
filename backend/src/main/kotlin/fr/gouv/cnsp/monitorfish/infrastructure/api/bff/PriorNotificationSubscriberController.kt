package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationSubscribersFilter
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.sorters.PriorNotificationSubscribersSortColumn
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.PriorNotificationSubscriberDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.*
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import org.springframework.data.domain.Sort
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/bff/v1/prior_notification_subscribers")
@Tag(name = "Prior notifications endpoints")
class PriorNotificationSubscriberController(
    private val getPriorNotificationSubscriber: GetPriorNotificationSubscriber,
    private val getPriorNotificationSubscribers: GetPriorNotificationSubscribers,
    private val updatePriorNotificationSubscriber: UpdatePriorNotificationSubscriber,
) {
    @GetMapping("")
    @Operation(summary = "Get all prior notification subscribers")
    fun getAll(
        @Parameter(description = "Administration ID.")
        @RequestParam(name = "administrationId")
        administrationId: Int? = null,
        @Parameter(description = "Port locode.")
        @RequestParam(name = "portLocode")
        portLocode: String? = null,
        @Parameter(description = "Search query (vessel name).")
        @RequestParam(name = "searchQuery")
        searchQuery: String? = null,
        @Parameter(description = "Sort column.")
        @RequestParam(name = "sortColumn")
        sortColumn: PriorNotificationSubscribersSortColumn,
        @Parameter(description = "Sort order.")
        @RequestParam(name = "sortDirection")
        sortDirection: Sort.Direction,
    ): List<PriorNotificationSubscriberDataOutput> {
        val filter =
            PriorNotificationSubscribersFilter(
                administrationId = administrationId,
                portLocode = portLocode,
                searchQuery = searchQuery,
            )

        val priorNotificationSubscribers = getPriorNotificationSubscribers.execute(filter, sortColumn, sortDirection)

        return priorNotificationSubscribers.map {
            PriorNotificationSubscriberDataOutput.fromPriorNotificationSubscriber(it)
        }
    }

    @GetMapping("/{controlUnitId}")
    @Operation(summary = "Get a prior notification subscriber by its `controlUnitId`")
    fun getOne(
        @PathParam("Control unit ID")
        @PathVariable(name = "controlUnitId")
        controlUnitId: Int,
    ): PriorNotificationSubscriberDataOutput {
        val priorNotificationsSubscriber = getPriorNotificationSubscriber.execute(controlUnitId)

        return PriorNotificationSubscriberDataOutput.fromPriorNotificationSubscriber(
            priorNotificationsSubscriber,
        )
    }

    @PutMapping("/{controlUnitId}")
    @Operation(summary = "Update a prior notification subscriber by its `controlUnitId`")
    fun updateOne(
        @PathParam("Control unit ID")
        @PathVariable(name = "controlUnitId")
        controlUnitId: Int,
        @RequestBody
        priorNotificationSubscriberDataInput: PriorNotificationSubscriberDataInput,
    ): PriorNotificationSubscriberDataOutput {
        val (fleetSegmentSubscriptions, portSubscriptions, vesselSubscriptions) =
            priorNotificationSubscriberDataInput.toSubscriptions()

        println("controlUnitId: $controlUnitId")
        val updatedPriorNotificationSubscriber =
            updatePriorNotificationSubscriber.execute(
                controlUnitId,
                fleetSegmentSubscriptions,
                portSubscriptions,
                vesselSubscriptions,
            )

        return PriorNotificationSubscriberDataOutput.fromPriorNotificationSubscriber(
            updatedPriorNotificationSubscriber,
        )
    }
}
