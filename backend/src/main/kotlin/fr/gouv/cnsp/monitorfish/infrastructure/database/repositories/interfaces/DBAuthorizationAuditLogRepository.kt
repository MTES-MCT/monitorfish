package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.AuthorizationAuditLogEntity
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface DBAuthorizationAuditLogRepository : CrudRepository<AuthorizationAuditLogEntity, Int> {
    // Parameters are cast so that PostgreSQL can type them when they are null
    @Query(
        nativeQuery = true,
        value = """
        SELECT *
        FROM authorization_audit_logs
        WHERE
            (CAST(:action AS VARCHAR) IS NULL OR action = CAST(:action AS VARCHAR))
            AND (
                CAST(:searchPattern AS VARCHAR) IS NULL
                OR actor_email ILIKE CAST(:searchPattern AS VARCHAR)
                OR target ILIKE CAST(:searchPattern AS VARCHAR)
                OR CAST(details AS VARCHAR) ILIKE CAST(:searchPattern AS VARCHAR)
            )
        ORDER BY created_at_utc DESC, id DESC
        """,
        countQuery = """
        SELECT COUNT(*)
        FROM authorization_audit_logs
        WHERE
            (CAST(:action AS VARCHAR) IS NULL OR action = CAST(:action AS VARCHAR))
            AND (
                CAST(:searchPattern AS VARCHAR) IS NULL
                OR actor_email ILIKE CAST(:searchPattern AS VARCHAR)
                OR target ILIKE CAST(:searchPattern AS VARCHAR)
                OR CAST(details AS VARCHAR) ILIKE CAST(:searchPattern AS VARCHAR)
            )
        """,
    )
    fun findAllByActionAndSearchPattern(
        action: String?,
        searchPattern: String?,
        pageable: Pageable,
    ): Page<AuthorizationAuditLogEntity>
}
