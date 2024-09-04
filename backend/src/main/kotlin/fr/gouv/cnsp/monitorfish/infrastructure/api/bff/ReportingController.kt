package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.CreateReportingDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UpdateReportingDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.ReportingDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/bff/v1/reportings")
@Tag(name = "APIs for reporting")
class ReportingController(
    private val archiveReporting: ArchiveReporting,
    private val archiveReportings: ArchiveReportings,
    private val updateReporting: UpdateReporting,
    private val deleteReporting: DeleteReporting,
    private val deleteReportings: DeleteReportings,
    private val getAllCurrentReportings: GetAllCurrentReportings,
    private val addReporting: AddReporting,
) {
    @PostMapping(value = [""], consumes = ["application/json"])
    @Operation(summary = "Create a reporting")
    @ResponseStatus(HttpStatus.CREATED)
    fun createReporting(
        @RequestBody
        reportingInput: CreateReportingDataInput,
    ): ReportingDataOutput {
        val (createdReporting, controlUnit) = addReporting.execute(reportingInput.toReporting())

        return ReportingDataOutput.fromReporting(createdReporting, controlUnit)
    }

    @GetMapping(value = [""])
    @Operation(summary = "Get all current reportings")
    fun getAllReportings(): List<ReportingDataOutput> {
        return getAllCurrentReportings.execute().map {
            ReportingDataOutput.fromReporting(it.first, it.second)
        }
    }

    @PutMapping(value = ["/{reportingId}/archive"])
    @Operation(summary = "Archive a reporting")
    fun archiveReporting(
        @PathParam("Reporting id")
        @PathVariable(name = "reportingId")
        reportingId: Int,
    ) {
        archiveReporting.execute(reportingId)
    }

    @PutMapping(value = ["/{reportingId}/update"], consumes = ["application/json"])
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
                reportingId,
                updateReportingInput.toUpdatedReportingValues(),
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

    @PutMapping(value = ["/{reportingId}/delete"])
    @Operation(summary = "Delete a reporting")
    fun deleteReporting(
        @PathParam("Reporting id")
        @PathVariable(name = "reportingId")
        reportingId: Int,
    ) {
        deleteReporting.execute(reportingId)
    }

    @PutMapping(value = ["/delete"])
    @Operation(summary = "Delete multiple reportings")
    fun deleteReporting(
        @RequestBody ids: List<Int>,
    ) {
        deleteReportings.execute(ids)
    }
}
