package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditAction
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditLog
import fr.gouv.cnsp.monitorfish.domain.utils.PaginatedList

interface AuthorizationAuditLogRepository {
    fun save(authorizationAuditLog: AuthorizationAuditLog)

    /** Most recent first. `searchQuery` also matches the emails of an administration list import. */
    fun findAll(
        action: AuthorizationAuditAction?,
        searchQuery: String?,
        pageNumber: Int,
        pageSize: Int,
    ): PaginatedList<AuthorizationAuditLog, Unit>
}
