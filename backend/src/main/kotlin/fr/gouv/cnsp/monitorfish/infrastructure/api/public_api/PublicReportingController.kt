package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.ArchiveReporting
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/reportings")
@Tag(name = "Public APIs for reporting")
class PublicReportingController(
    private val archiveReporting: ArchiveReporting,
) {

    @PutMapping(value = ["/{reportingId}/archive"])
    @Operation(summary = "Archive a reporting")
    fun archiveReporting(
        @PathParam("Reporting id")
        @PathVariable(name = "reportingId")
        reportingId: Int,
    ) {
        archiveReporting.execute(reportingId)
    }
}
