package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.entities.facade.SeafrontGroup
import fr.gouv.cnsp.monitorfish.domain.entities.facade.hasSeafront
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationsFilter
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.sorters.PriorNotificationsSortColumn
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.CreateOrUpdateManualPriorNotification
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.GetPriorNotification
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.GetPriorNotificationTypes
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.GetPriorNotifications
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.ManualPriorNotificationDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.*
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import org.springframework.data.domain.Sort
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/bff/v1/prior_notifications")
@Tag(name = "Prior notifications endpoints")
class PriorNotificationController(
    private val createOrUpdateManualPriorNotification: CreateOrUpdateManualPriorNotification,
    private val getPriorNotification: GetPriorNotification,
    private val getPriorNotifications: GetPriorNotifications,
    private val getPriorNotificationTypes: GetPriorNotificationTypes,
) {
    @GetMapping("")
    @Operation(summary = "Get all prior notifications")
    fun getAll(
        @Parameter(description = "Vessels flag states (countries Alpha3 codes).")
        @RequestParam(name = "flagStates")
        flagStates: List<String>? = null,
        @Parameter(description = "Vessels that have one or more reportings.")
        @RequestParam(name = "hasOneOrMoreReportings")
        hasOneOrMoreReportings: Boolean? = null,
        @Parameter(description = "Vessels that are less than 12 meters in length.")
        @RequestParam(name = "isLessThanTwelveMetersVessel")
        isLessThanTwelveMetersVessel: Boolean? = null,
        @Parameter(description = "Vessels that were last controlled after the given date.")
        @RequestParam(name = "lastControlledAfter")
        lastControlledAfter: String? = null,
        @Parameter(description = "Vessels that were last controlled before the given date.")
        @RequestParam(name = "lastControlledBefore")
        lastControlledBefore: String? = null,
        @Parameter(description = "Landings port locodes.")
        @RequestParam(name = "portLocodes")
        portLocodes: List<String>? = null,
        @Parameter(description = "Prior notification types.")
        @RequestParam(name = "priorNotificationTypes")
        priorNotificationTypes: List<String>? = null,
        @Parameter(description = "Search query (vessel name).")
        @RequestParam(name = "searchQuery")
        searchQuery: String? = null,
        @Parameter(description = "Caught species codes.")
        @RequestParam(name = "specyCodes")
        specyCodes: List<String>? = null,
        @Parameter(description = "Trip gear codes.")
        @RequestParam(name = "tripGearCodes")
        tripGearCodes: List<String>? = null,
        @Parameter(description = "Trip segment segments.")
        @RequestParam(name = "tripSegmentCodes")
        tripSegmentCodes: List<String>? = null,
        @Parameter(description = "Vessels that will arrive after the given date.")
        @RequestParam(name = "willArriveAfter")
        willArriveAfter: String,
        @Parameter(description = "Vessels that will arrive before the given date.")
        @RequestParam(name = "willArriveBefore")
        willArriveBefore: String,

        @Parameter(description = "Seafront group.")
        @RequestParam(name = "seafrontGroup")
        seafrontGroup: SeafrontGroup,

        @Parameter(description = "Sort column.")
        @RequestParam(name = "sortColumn")
        sortColumn: PriorNotificationsSortColumn,
        @Parameter(description = "Sort order.")
        @RequestParam(name = "sortDirection")
        sortDirection: Sort.Direction,
        @Parameter(description = "Number of items per page.")
        @RequestParam(name = "pageSize")
        pageSize: Int,
        @Parameter(description = "Page number (0-indexed).")
        @RequestParam(name = "pageNumber")
        pageNumber: Int,
    ): PaginatedListDataOutput<PriorNotificationListItemDataOutput, PriorNotificationsExtraDataOutput> {
        val priorNotificationsFilter = PriorNotificationsFilter(
            flagStates = flagStates,
            hasOneOrMoreReportings = hasOneOrMoreReportings,
            isLessThanTwelveMetersVessel = isLessThanTwelveMetersVessel,
            lastControlledAfter = lastControlledAfter,
            lastControlledBefore = lastControlledBefore,
            portLocodes = portLocodes,
            priorNotificationTypes = priorNotificationTypes,
            searchQuery = searchQuery,
            specyCodes = specyCodes,
            tripGearCodes = tripGearCodes,
            tripSegmentCodes = tripSegmentCodes,
            willArriveAfter = willArriveAfter,
            willArriveBefore = willArriveBefore,
        )

        val priorNotifications = getPriorNotifications
            .execute(priorNotificationsFilter, sortColumn, sortDirection)
        val priorNotificationListItemDataOutputsFilteredBySeafrontGroup = priorNotifications
            .filter { seafrontGroup.hasSeafront(it.seafront) }
            .mapNotNull { PriorNotificationListItemDataOutput.fromPriorNotification(it) }

        val extraDataOutput = PriorNotificationsExtraDataOutput(
            perSeafrontGroupCount = SeafrontGroup.entries.associateWith { seafrontGroupEntry ->
                priorNotifications.count { priorNotification ->
                    seafrontGroupEntry.hasSeafront(priorNotification.seafront)
                }
            },
        )

        return PaginatedListDataOutput.fromListDataOutput(
            priorNotificationListItemDataOutputsFilteredBySeafrontGroup,
            pageNumber,
            pageSize,
            extraDataOutput,
        )
    }

    @GetMapping("/{reportId}")
    @Operation(summary = "Get a prior notification by its `reportId`")
    fun getOne(
        @PathParam("Logbook message `reportId`")
        @PathVariable(name = "reportId")
        reportId: String,
    ): PriorNotificationDetailDataOutput {
        return PriorNotificationDetailDataOutput.fromPriorNotification(
            getPriorNotification.execute(reportId),
        )
    }

    @GetMapping("/manual/{reportId}")
    @Operation(summary = "Get a manual prior notification form data by its `reportId`")
    fun getOneData(
        @PathParam("Logbook message `reportId`")
        @PathVariable(name = "reportId")
        reportId: String,
    ): ManualPriorNotificationDataOutput {
        return ManualPriorNotificationDataOutput.fromPriorNotification(
            getPriorNotification.execute(reportId),
        )
    }

    @GetMapping("/types")
    @Operation(summary = "Get all prior notification types")
    fun getAllTypes(): List<String> {
        return getPriorNotificationTypes.execute()
    }

    @PostMapping("/manual")
    @Operation(summary = "Create a new manual prior notification")
    fun create(
        @RequestBody
        manualPriorNotificationDataInput: ManualPriorNotificationDataInput,
    ): ManualPriorNotificationDataOutput {
        val createdPriorNotification = createOrUpdateManualPriorNotification.execute(
            manualPriorNotificationDataInput.authorTrigram,
            manualPriorNotificationDataInput.didNotFishAfterZeroNotice,
            manualPriorNotificationDataInput.expectedArrivalDate,
            manualPriorNotificationDataInput.expectedLandingDate,
            manualPriorNotificationDataInput.faoArea,
            manualPriorNotificationDataInput.fishingCatches.map { it.toLogbookFishingCatch() },
            manualPriorNotificationDataInput.note,
            manualPriorNotificationDataInput.portLocode,
            null,
            manualPriorNotificationDataInput.sentAt,
            manualPriorNotificationDataInput.tripGearCodes,
            manualPriorNotificationDataInput.vesselId,
        )

        return ManualPriorNotificationDataOutput.fromPriorNotification(createdPriorNotification)
    }

    @PutMapping("/manual/{reportId}")
    @Operation(summary = "Update a manual prior notification by its `reportId`")
    fun update(
        @PathParam("Logbook message `reportId`")
        @PathVariable(name = "reportId")
        reportId: String,
        @RequestBody
        manualPriorNotificationDataInput: ManualPriorNotificationDataInput,
    ): ManualPriorNotificationDataOutput {
        val updatedPriorNotification = createOrUpdateManualPriorNotification.execute(
            manualPriorNotificationDataInput.authorTrigram,
            manualPriorNotificationDataInput.didNotFishAfterZeroNotice,
            manualPriorNotificationDataInput.expectedArrivalDate,
            manualPriorNotificationDataInput.expectedLandingDate,
            manualPriorNotificationDataInput.faoArea,
            manualPriorNotificationDataInput.fishingCatches.map { it.toLogbookFishingCatch() },
            manualPriorNotificationDataInput.note,
            manualPriorNotificationDataInput.portLocode,
            reportId,
            manualPriorNotificationDataInput.sentAt,
            manualPriorNotificationDataInput.tripGearCodes,
            manualPriorNotificationDataInput.vesselId,
        )

        return ManualPriorNotificationDataOutput.fromPriorNotification(updatedPriorNotification)
    }
}
