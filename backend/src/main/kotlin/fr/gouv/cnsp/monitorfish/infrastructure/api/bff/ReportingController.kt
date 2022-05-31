package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.ArchiveReporting
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.DeleteReporting
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import javax.websocket.server.PathParam

@RestController
@RequestMapping("/bff/v1/reporting")
@Api(description = "APIs for reporting")
class ReportingController(
        private val archiveReporting: ArchiveReporting,
        private val deleteReporting: DeleteReporting) {

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
