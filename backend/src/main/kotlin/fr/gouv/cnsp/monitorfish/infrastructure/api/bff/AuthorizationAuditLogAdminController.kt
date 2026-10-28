package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditAction
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetAllAuthorizationAuditLogs
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.AuthorizationAuditLogDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.PaginatedListDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/admin/authorization_audit_logs")
@Tag(name = "APIs for the audit trail of user authorizations")
class AuthorizationAuditLogAdminController(
    private val getAllAuthorizationAuditLogs: GetAllAuthorizationAuditLogs,
) {
    @GetMapping("")
    @Operation(summary = "Get the changes of user authorizations, most recent first (paginated)")
    fun getAll(
        @RequestParam(required = false)
        action: AuthorizationAuditAction?,
        @Parameter(description = "Searched in the actor email, the target and the details")
        @RequestParam(required = false)
        searchQuery: String?,
        @Parameter(description = "Page number (0-indexed)")
        @RequestParam(required = true)
        pageNumber: Int,
        @Parameter(description = "Number of items per page")
        @RequestParam(required = true)
        pageSize: Int,
    ): PaginatedListDataOutput<AuthorizationAuditLogDataOutput, Unit> {
        val paginatedAuthorizationAuditLogs =
            getAllAuthorizationAuditLogs.execute(action, searchQuery, pageNumber, pageSize)

        return PaginatedListDataOutput(
            data =
                paginatedAuthorizationAuditLogs.data.map {
                    AuthorizationAuditLogDataOutput.fromAuthorizationAuditLog(
                        it,
                    )
                },
            extraData = Unit,
            lastPageNumber = paginatedAuthorizationAuditLogs.lastPageNumber,
            pageNumber = paginatedAuthorizationAuditLogs.pageNumber,
            pageSize = paginatedAuthorizationAuditLogs.pageSize,
            totalLength = paginatedAuthorizationAuditLogs.totalLength,
        )
    }
}
