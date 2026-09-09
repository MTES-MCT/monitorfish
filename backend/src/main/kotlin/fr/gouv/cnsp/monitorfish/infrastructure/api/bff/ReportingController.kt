package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.entities.facade.SeafrontGroup
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingOrigin
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingPeriod
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingsFilter
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.sorters.ReportingsSortColumn
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.AddReporting
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.ArchiveReporting
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.ArchiveReportings
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.DeleteReporting
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.DeleteReportings
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.GetReporting
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.GetReportings
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.GetReportingsList
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.UpdateReporting
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.CreateReportingDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UpdateReportingDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.DisplayedReportingDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.PaginatedListDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.ReportingDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.ReportingsExtraDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import org.locationtech.jts.io.WKTReader
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.time.ZonedDateTime

@RestController
@RequestMapping("/bff/v1/reportings")
@Tag(name = "APIs for reporting")
class ReportingController(
    private val archiveReporting: ArchiveReporting,
    private val archiveReportings: ArchiveReportings,
    private val updateReporting: UpdateReporting,
    private val deleteReporting: DeleteReporting,
    private val deleteReportings: DeleteReportings,
    private val getReportingsList: GetReportingsList,
    private val addReporting: AddReporting,
    private val getReportings: GetReportings,
    private val getReporting: GetReporting,
) {
    @PostMapping(value = [""], consumes = ["application/json"])
    @Operation(summary = "Create a reporting")
    @ResponseStatus(HttpStatus.CREATED)
    fun createReporting(
        @RequestBody
        reportingInput: CreateReportingDataInput,
        @AuthenticationPrincipal principal: OidcUser,
    ): ReportingDataOutput {
        val email = principal.email ?: ""
        val (createdReporting, controlUnit) =
            addReporting.execute(
                newReporting = reportingInput.toReporting(createdBy = email),
            )

        return ReportingDataOutput.fromReporting(createdReporting, controlUnit)
    }

    @GetMapping(value = ["/{reportingId}"])
    @Operation(summary = "Get a reporting by id")
    fun getReporting(
        @PathParam("Reporting id")
        @PathVariable(name = "reportingId")
        reportingId: Int,
    ): ReportingDataOutput {
        val reporting = getReporting.execute(reportingId)
        return ReportingDataOutput.fromReporting(reporting, controlUnit = null, useThreatHierarchyForForm = true)
    }

    @GetMapping(value = ["/display"])
    @Operation(summary = "Get reportings to be displayed on the map by filter")
    fun getReportings(
        @RequestParam(required = false)
        isArchived: Boolean?,
        @RequestParam(required = false)
        isIUU: Boolean?,
        @RequestParam(required = false)
        reportingType: ReportingType?,
        @RequestParam(required = true)
        reportingPeriod: ReportingPeriod,
        @RequestParam(required = false)
        startDate: ZonedDateTime?,
        @RequestParam(required = false)
        endDate: ZonedDateTime?,
        @Parameter(description = "Source of the reporting")
        @RequestParam(required = false)
        origin: ReportingOrigin?,
        @Parameter(description = "Zone to filter the reportings in, as a WKT geometry")
        @RequestParam(required = false)
        zone: String?,
        @RequestParam(required = false)
        ids: List<Int>?,
    ): List<DisplayedReportingDataOutput> =
        getReportings
            .execute(
                toReportingsFilter(
                    isArchived = isArchived,
                    isIUU = isIUU,
                    reportingType = reportingType,
                    reportingPeriod = reportingPeriod,
                    startDate = startDate,
                    endDate = endDate,
                    origin = origin,
                    zone = zone,
                    ids = ids,
                ),
            ).map { (reporting, controlUnit) -> DisplayedReportingDataOutput.fromReporting(reporting, controlUnit) }

    @GetMapping(value = [""])
    @Operation(summary = "Get a page of the reporting list by filter")
    fun getAllReportings(
        @RequestParam(required = false)
        isArchived: Boolean?,
        @RequestParam(required = false)
        isIUU: Boolean?,
        @RequestParam(required = false)
        reportingType: ReportingType?,
        @RequestParam(required = true)
        reportingPeriod: ReportingPeriod,
        @RequestParam(required = false)
        startDate: ZonedDateTime?,
        @RequestParam(required = false)
        endDate: ZonedDateTime?,
        @Parameter(description = "Source of the reporting")
        @RequestParam(required = false)
        origin: ReportingOrigin?,
        @Parameter(description = "Zone to filter the reportings in, as a WKT geometry")
        @RequestParam(required = false)
        zone: String?,
        @Parameter(description = "Only keep the reportings of vessels without a vessel record")
        @RequestParam(required = false)
        absentVessel: Boolean?,
        @Parameter(description = "Seafront group")
        @RequestParam(required = true)
        seafrontGroup: SeafrontGroup,
        @RequestParam(required = false)
        searchQuery: String?,
        @Parameter(description = "Sort column")
        @RequestParam(required = true)
        sortColumn: ReportingsSortColumn,
        @Parameter(description = "Sort order")
        @RequestParam(required = true)
        sortDirection: Sort.Direction,
        @Parameter(description = "Number of items per page")
        @RequestParam(required = true)
        pageSize: Int,
        @Parameter(description = "Page number (0-indexed)")
        @RequestParam(required = true)
        pageNumber: Int,
    ): PaginatedListDataOutput<ReportingDataOutput, ReportingsExtraDataOutput> {
        val page =
            getReportingsList.execute(
                filter =
                    toReportingsFilter(
                        isArchived = isArchived,
                        isIUU = isIUU,
                        reportingType = reportingType,
                        reportingPeriod = reportingPeriod,
                        startDate = startDate,
                        endDate = endDate,
                        origin = origin,
                        zone = zone,
                        ids = null,
                    ),
                seafrontGroup = seafrontGroup,
                searchQuery = searchQuery,
                absentVessel = absentVessel,
                sortColumn = sortColumn,
                sortDirection = sortDirection,
                pageNumber = pageNumber,
                pageSize = pageSize,
            )

        return PaginatedListDataOutput(
            data =
                page.data.map { (reporting, controlUnit) ->
                    ReportingDataOutput.fromReporting(
                        reporting = reporting,
                        controlUnit = controlUnit,
                        useThreatHierarchyForForm = true,
                    )
                },
            extraData = ReportingsExtraDataOutput.fromReportingStats(page.extraData),
            lastPageNumber = page.lastPageNumber,
            pageNumber = page.pageNumber,
            pageSize = page.pageSize,
            totalLength = page.totalLength,
        )
    }

    private fun toReportingsFilter(
        isArchived: Boolean?,
        isIUU: Boolean?,
        reportingType: ReportingType?,
        reportingPeriod: ReportingPeriod,
        startDate: ZonedDateTime?,
        endDate: ZonedDateTime?,
        origin: ReportingOrigin?,
        zone: String?,
        ids: List<Int>?,
    ) = ReportingsFilter(
        reportingPeriod = reportingPeriod,
        startDate = startDate,
        endDate = endDate,
        isArchived = isArchived,
        isIUU = isIUU,
        reportingType = reportingType,
        origin = origin,
        zone = zone?.takeIf { it.isNotBlank() }?.let { WKTReader().read(it) },
        ids = ids,
    )

    @PutMapping(value = ["/{reportingId}/archive"])
    @Operation(summary = "Archive a reporting")
    fun archiveReporting(
        @PathParam("Reporting id")
        @PathVariable(name = "reportingId")
        reportingId: Int,
    ) {
        archiveReporting.execute(reportingId)
    }

    @PutMapping(value = ["/{reportingId}"], consumes = ["application/json"])
    @Operation(summary = "Update a reporting")
    fun updateReporting(
        @PathParam("Reporting id")
        @PathVariable(name = "reportingId")
        reportingId: Int,
        @RequestBody
        updateReportingInput: UpdateReportingDataInput,
    ): ReportingDataOutput {
        val (updatedReporting, controlUnit) =
            updateReporting.execute(
                reportingId = reportingId,
                reportingUpdateCommand = updateReportingInput.toUpdatedReportingValues(),
            )

        return ReportingDataOutput.fromReporting(updatedReporting, controlUnit)
    }

    @PutMapping(value = ["/archive"])
    @Operation(summary = "Archive multiple reportings")
    fun archiveReportings(
        @RequestBody ids: List<Int>,
    ) {
        archiveReportings.execute(ids)
    }

    @DeleteMapping(value = ["/{reportingId}"])
    @Operation(summary = "Delete a reporting")
    fun deleteReporting(
        @PathParam("Reporting id")
        @PathVariable(name = "reportingId")
        reportingId: Int,
    ) {
        deleteReporting.execute(reportingId)
    }

    @DeleteMapping(value = [""])
    @Operation(summary = "Delete multiple reportings")
    fun deleteReporting(
        @RequestBody ids: List<Int>,
    ) {
        deleteReportings.execute(ids)
    }
}
