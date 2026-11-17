package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditAction
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditLog
import fr.gouv.cnsp.monitorfish.domain.repositories.AuthorizationAuditLogRepository
import fr.gouv.cnsp.monitorfish.domain.utils.PaginatedList

@UseCase
class GetAllAuthorizationAuditLogs(
    private val authorizationAuditLogRepository: AuthorizationAuditLogRepository,
) {
    fun execute(
        action: AuthorizationAuditAction?,
        searchQuery: String?,
        pageNumber: Int,
        pageSize: Int,
    ): PaginatedList<AuthorizationAuditLog, Unit> =
        authorizationAuditLogRepository.findAll(
            action = action,
            searchQuery = searchQuery?.trim()?.takeIf { it.isNotEmpty() },
            pageNumber = pageNumber.coerceAtLeast(0),
            pageSize = pageSize.coerceIn(1, MAX_PAGE_SIZE),
        )

    companion object {
        const val MAX_PAGE_SIZE = 500
    }
}
