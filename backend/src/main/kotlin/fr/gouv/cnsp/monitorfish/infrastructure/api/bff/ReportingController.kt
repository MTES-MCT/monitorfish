package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.AddReporting
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.ArchiveReporting
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.DeleteReporting
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.CreateReportingDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.ReportingDataOutput
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import javax.websocket.server.PathParam

@RestController
@RequestMapping("/bff/v1/reportings")
@Api(description = "APIs for reporting")
class ReportingController(
        private val archiveReporting: ArchiveReporting,
        private val deleteReporting: DeleteReporting,
        private val addReporting: AddReporting) {

    @PostMapping(value = [""], consumes = ["application/json"])
    @ApiOperation("Create a reporting")
    @ResponseStatus(HttpStatus.CREATED)
    fun createReporting(@RequestBody
                        reportingInput: CreateReportingDataInput): ReportingDataOutput {
        return ReportingDataOutput.fromReporting(addReporting.execute(reportingInput.toReporting()))
    }

    @PutMapping(value = ["/{reportingId}/archive"])
    @ApiOperation("Archive a reporting")
    fun archiveReporting(@PathParam("Reporting id")
                         @PathVariable(name = "reportingId")
                         reportingId: Int) {
        archiveReporting.execute(reportingId)
    }

    @PutMapping(value = ["/{reportingId}/delete"])
    @ApiOperation("Delete a reporting")
    fun deleteReporting(@PathParam("Reporting id")
                        @PathVariable(name = "reportingId")
                        reportingId: Int) {
        deleteReporting.execute(reportingId)
    }
}
