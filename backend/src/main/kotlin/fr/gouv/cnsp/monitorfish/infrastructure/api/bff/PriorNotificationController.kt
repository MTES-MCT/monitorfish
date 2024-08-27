package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.entities.facade.SeafrontGroup
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationState
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationsFilter
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.sorters.PriorNotificationsSortColumn
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.LogbookPriorNotificationFormDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.ManualPriorNotificationComputeDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.ManualPriorNotificationFormDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.*
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import org.springframework.data.domain.Sort
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter.ISO_DATE_TIME

@RestController
@RequestMapping("/bff/v1/prior_notifications")
@Tag(name = "Prior notifications endpoints")
class PriorNotificationController(
    private val computeManualPriorNotification: ComputeManualPriorNotification,
    private val createOrUpdateManualPriorNotification: CreateOrUpdateManualPriorNotification,
    private val getPriorNotification: GetPriorNotification,
    private val getPriorNotificationPdfDocument: GetPriorNotificationPdfDocument,
    private val getPriorNotifications: GetPriorNotifications,
    private val getNumberToVerify: GetNumberToVerify,
    private val getPriorNotificationTypes: GetPriorNotificationTypes,
    private val updateLogbookPriorNotification: UpdateLogbookPriorNotification,
    private val verifyAndSendPriorNotification: VerifyAndSendPriorNotification,
    private val invalidatePriorNotification: InvalidatePriorNotification,
) {
    data class Status(val status: String)

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
        @Parameter(description = "States.")
        @RequestParam(name = "states")
        states: List<PriorNotificationState>? = null,

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

        val paginatedPriorNotifications = getPriorNotifications
            .execute(priorNotificationsFilter, seafrontGroup, states, sortColumn, sortDirection, pageNumber, pageSize)
        val priorNotificationListItemDataOutputs = paginatedPriorNotifications.data
            .mapNotNull { PriorNotificationListItemDataOutput.fromPriorNotification(it) }
        val extraDataOutput = PriorNotificationsExtraDataOutput
            .fromPriorNotificationStats(paginatedPriorNotifications.extraData)

        return PaginatedListDataOutput(
            priorNotificationListItemDataOutputs,
            extraDataOutput,
            lastPageNumber = paginatedPriorNotifications.lastPageNumber,
            pageNumber = paginatedPriorNotifications.pageNumber,
            pageSize = paginatedPriorNotifications.pageSize,
            totalLength = paginatedPriorNotifications.totalLength,
        )
    }

    @GetMapping("/logbook/{reportId}/form")
    @Operation(summary = "Get a logbook prior notification form data by its `reportId`")
    fun getLogbookFormData(
        @PathParam("Logbook message `reportId`")
        @PathVariable(name = "reportId")
        reportId: String,
        @Parameter(description = "Operation date (to optimize SQL query via Timescale).")
        @RequestParam(name = "operationDate")
        operationDate: ZonedDateTime,
    ): LogbookPriorNotificationFormDataOutput {
        return LogbookPriorNotificationFormDataOutput.fromPriorNotification(
            getPriorNotification.execute(
                reportId,
                operationDate,
                false,
            ),
        )
    }

    @PutMapping("/logbook/{reportId}")
    @Operation(summary = "Update a logbook prior notification by its `reportId`")
    fun updateLogbook(
        @PathParam("Logbook message `reportId`")
        @PathVariable(name = "reportId")
        reportId: String,
        @Parameter(description = "Operation date (to optimize SQL query via Timescale).")
        @RequestParam(name = "operationDate")
        operationDate: ZonedDateTime,
        @RequestBody
        logbookPriorNotificationFormDataInput: LogbookPriorNotificationFormDataInput,
    ): LogbookPriorNotificationFormDataOutput {
        val updatedPriorNotification = updateLogbookPriorNotification.execute(
            reportId = reportId,
            operationDate = operationDate,
            authorTrigram = logbookPriorNotificationFormDataInput.authorTrigram,
            note = logbookPriorNotificationFormDataInput.note,
        )

        return LogbookPriorNotificationFormDataOutput.fromPriorNotification(updatedPriorNotification)
    }

    @PostMapping("/manual/compute")
    @Operation(
        summary = "Calculate manual prior notification fleet segments, prior notification types, risk factor and next state",
    )
    fun getManualComputation(
        @RequestBody
        manualPriorNotificationComputeDataInput: ManualPriorNotificationComputeDataInput,
    ): ManualPriorNotificationComputedValuesDataOutput {
        val fishingCatches = manualPriorNotificationComputeDataInput.fishingCatches.map { it.toLogbookFishingCatch() }

        val manualPriorNotificationComputedValues = computeManualPriorNotification.execute(
            fishingCatches = fishingCatches,
            globalFaoArea = manualPriorNotificationComputeDataInput.globalFaoArea,
            portLocode = manualPriorNotificationComputeDataInput.portLocode,
            tripGearCodes = manualPriorNotificationComputeDataInput.tripGearCodes,
            vesselId = manualPriorNotificationComputeDataInput.vesselId,
        )

        return ManualPriorNotificationComputedValuesDataOutput
            .fromManualPriorNotificationComputedValues(manualPriorNotificationComputedValues)
    }

    @GetMapping("/manual/{reportId}/form")
    @Operation(summary = "Get a manual prior notification form data by its `reportId`")
    fun getManualData(
        @PathParam("Logbook message `reportId`")
        @PathVariable(name = "reportId")
        reportId: String,
        @Parameter(description = "Operation date (to optimize SQL query via Timescale).")
        @RequestParam(name = "operationDate")
        operationDate: ZonedDateTime,
    ): ManualPriorNotificationFormDataOutput {
        return ManualPriorNotificationFormDataOutput.fromPriorNotification(
            getPriorNotification.execute(
                reportId,
                operationDate,
                true,
            ),
        )
    }

    @PostMapping("/manual")
    @Operation(summary = "Create a new manual prior notification")
    fun createManual(
        @RequestBody
        manualPriorNotificationFormDataInput: ManualPriorNotificationFormDataInput,
    ): ManualPriorNotificationFormDataOutput {
        val createdPriorNotification = createOrUpdateManualPriorNotification.execute(
            hasPortEntranceAuthorization = manualPriorNotificationFormDataInput.hasPortEntranceAuthorization,
            hasPortLandingAuthorization = manualPriorNotificationFormDataInput.hasPortLandingAuthorization,
            authorTrigram = manualPriorNotificationFormDataInput.authorTrigram,
            didNotFishAfterZeroNotice = manualPriorNotificationFormDataInput.didNotFishAfterZeroNotice,
            expectedArrivalDate = manualPriorNotificationFormDataInput.expectedArrivalDate,
            expectedLandingDate = manualPriorNotificationFormDataInput.expectedLandingDate,
            globalFaoArea = manualPriorNotificationFormDataInput.globalFaoArea,
            fishingCatches = manualPriorNotificationFormDataInput.fishingCatches.map { it.toLogbookFishingCatch() },
            note = manualPriorNotificationFormDataInput.note,
            portLocode = manualPriorNotificationFormDataInput.portLocode,
            reportId = null,
            sentAt = manualPriorNotificationFormDataInput.sentAt,
            purpose = manualPriorNotificationFormDataInput.purpose,
            tripGearCodes = manualPriorNotificationFormDataInput.tripGearCodes,
            vesselId = manualPriorNotificationFormDataInput.vesselId,
        )

        return ManualPriorNotificationFormDataOutput.fromPriorNotification(createdPriorNotification)
    }

    @PutMapping("/manual/{reportId}")
    @Operation(summary = "Update a manual prior notification by its `reportId`")
    fun updateManual(
        @PathParam("Logbook message `reportId`")
        @PathVariable(name = "reportId")
        reportId: String,
        @RequestBody
        manualPriorNotificationFormDataInput: ManualPriorNotificationFormDataInput,
    ): ManualPriorNotificationFormDataOutput {
        val updatedPriorNotification = createOrUpdateManualPriorNotification.execute(
            hasPortEntranceAuthorization = manualPriorNotificationFormDataInput.hasPortEntranceAuthorization,
            hasPortLandingAuthorization = manualPriorNotificationFormDataInput.hasPortLandingAuthorization,
            authorTrigram = manualPriorNotificationFormDataInput.authorTrigram,
            didNotFishAfterZeroNotice = manualPriorNotificationFormDataInput.didNotFishAfterZeroNotice,
            expectedArrivalDate = manualPriorNotificationFormDataInput.expectedArrivalDate,
            expectedLandingDate = manualPriorNotificationFormDataInput.expectedLandingDate,
            globalFaoArea = manualPriorNotificationFormDataInput.globalFaoArea,
            fishingCatches = manualPriorNotificationFormDataInput.fishingCatches.map { it.toLogbookFishingCatch() },
            note = manualPriorNotificationFormDataInput.note,
            portLocode = manualPriorNotificationFormDataInput.portLocode,
            reportId = reportId,
            sentAt = manualPriorNotificationFormDataInput.sentAt,
            purpose = manualPriorNotificationFormDataInput.purpose,
            tripGearCodes = manualPriorNotificationFormDataInput.tripGearCodes,
            vesselId = manualPriorNotificationFormDataInput.vesselId,
        )

        return ManualPriorNotificationFormDataOutput.fromPriorNotification(updatedPriorNotification)
    }

    @GetMapping("/to_verify")
    @Operation(summary = "Get number of prior notifications to verify")
    fun getNumberToVerify(): PriorNotificationsExtraDataOutput {
        val priorNotificationStats = getNumberToVerify.execute()

        return PriorNotificationsExtraDataOutput.fromPriorNotificationStats(priorNotificationStats)
    }

    @GetMapping("/types")
    @Operation(summary = "Get all prior notification types")
    fun getAllTypes(): List<String> {
        return getPriorNotificationTypes.execute()
    }

    @GetMapping("/{reportId}")
    @Operation(summary = "Get a prior notification by its `reportId`")
    fun getOne(
        @PathParam("Logbook message `reportId`")
        @PathVariable(name = "reportId")
        reportId: String,
        @Parameter(description = "Is the prior notification manually created?")
        @RequestParam(name = "isManuallyCreated")
        isManuallyCreated: Boolean,
        @Parameter(description = "Operation date (to optimize SQL query via Timescale).")
        @RequestParam(name = "operationDate")
        operationDate: ZonedDateTime,
    ): PriorNotificationDetailDataOutput {
        return PriorNotificationDetailDataOutput
            .fromPriorNotification(getPriorNotification.execute(reportId, operationDate, isManuallyCreated))
    }

    @GetMapping("/{reportId}/pdf")
    @Operation(summary = "Get the PDF document")
    fun getPdfDocument(
        @PathParam("Logbook message `reportId`")
        @PathVariable(name = "reportId")
        reportId: String,
    ): ResponseEntity<ByteArray?> {
        val pdfDocument = getPriorNotificationPdfDocument.execute(reportId = reportId, isVerifyingExistence = false)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null)

        val fileName = "preavis_debarquement_${pdfDocument.generationDatetimeUtc.format(ISO_DATE_TIME)}.pdf"
        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_PDF
            setContentDispositionFormData("attachment", fileName)
        }
        headers.add("x-generation-date", pdfDocument.generationDatetimeUtc.format(ISO_DATE_TIME))

        return ResponseEntity(pdfDocument.pdfDocument, headers, HttpStatus.OK)
    }

    @GetMapping("/{reportId}/pdf/exist")
    @Operation(summary = "Check the PDF document")
    fun getPdfDocumentExistence(
        @PathParam("Logbook message `reportId`")
        @PathVariable(name = "reportId")
        reportId: String,
    ): Status {
        val pdfDocument = getPriorNotificationPdfDocument.execute(reportId = reportId, isVerifyingExistence = true)
        if (pdfDocument?.pdfDocument == null) {
            return Status(HttpStatus.NO_CONTENT.name)
        }

        return Status(HttpStatus.FOUND.name)
    }

    @PostMapping("/{reportId}/verify_and_send")
    @Operation(summary = "Verify and send a prior notification by its `reportId`")
    fun verifyAndSend(
        @PathParam("Logbook message `reportId`")
        @PathVariable(name = "reportId")
        reportId: String,
        @Parameter(description = "Operation date (to optimize SQL query via Timescale).")
        @RequestParam(name = "operationDate")
        operationDate: ZonedDateTime,
        @Parameter(description = "Is the prior notification manually created?")
        @RequestParam(name = "isManuallyCreated")
        isManuallyCreated: Boolean,
    ): PriorNotificationDetailDataOutput {
        return PriorNotificationDetailDataOutput
            .fromPriorNotification(verifyAndSendPriorNotification.execute(reportId, operationDate, isManuallyCreated))
    }

    @PutMapping("/{reportId}/invalidate")
    @Operation(summary = "Invalidate a prior notification by its `reportId`")
    fun invalidate(
        @PathParam("Logbook message `reportId`")
        @PathVariable(name = "reportId")
        reportId: String,
        @Parameter(description = "Operation date (to optimize SQL query via Timescale).")
        @RequestParam(name = "operationDate")
        operationDate: ZonedDateTime,
        @Parameter(description = "Is the prior notification manually created?")
        @RequestParam(name = "isManuallyCreated")
        isManuallyCreated: Boolean,
    ): PriorNotificationDetailDataOutput {
        val updatedPriorNotification = invalidatePriorNotification.execute(
            reportId = reportId,
            operationDate = operationDate,
            isManuallyCreated = isManuallyCreated,
        )

        return PriorNotificationDetailDataOutput.fromPriorNotification(updatedPriorNotification)
    }
}
