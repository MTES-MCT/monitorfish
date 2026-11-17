package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditAction
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditLog
import fr.gouv.cnsp.monitorfish.domain.repositories.AuthorizationAuditLogRepository
import fr.gouv.cnsp.monitorfish.domain.utils.PaginatedList
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.AuthorizationAuditLogEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBAuthorizationAuditLogRepository
import jakarta.transaction.Transactional
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Repository

@Repository
class JpaAuthorizationAuditLogRepository(
    private val dbAuthorizationAuditLogRepository: DBAuthorizationAuditLogRepository,
) : AuthorizationAuditLogRepository {
    @Transactional
    override fun save(authorizationAuditLog: AuthorizationAuditLog) {
        dbAuthorizationAuditLogRepository.save(
            AuthorizationAuditLogEntity.fromAuthorizationAuditLog(authorizationAuditLog),
        )
    }

    override fun findAll(
        action: AuthorizationAuditAction?,
        searchQuery: String?,
        pageNumber: Int,
        pageSize: Int,
    ): PaginatedList<AuthorizationAuditLog, Unit> {
        val page =
            dbAuthorizationAuditLogRepository.findAllByActionAndSearchPattern(
                action = action?.name,
                searchPattern = searchQuery?.let { "%${escapeLikePattern(it)}%" },
                pageable = PageRequest.of(pageNumber, pageSize),
            )

        return PaginatedList(
            data = page.content.map { it.toAuthorizationAuditLog() },
            extraData = Unit,
            lastPageNumber = (page.totalPages - 1).coerceAtLeast(0),
            pageNumber = pageNumber,
            pageSize = pageSize,
            totalLength = page.totalElements.toInt(),
        )
    }

    private fun escapeLikePattern(value: String) =
        value
            .replace("\\", "\\\\")
            .replace("%", "\\%")
            .replace("_", "\\_")
}
