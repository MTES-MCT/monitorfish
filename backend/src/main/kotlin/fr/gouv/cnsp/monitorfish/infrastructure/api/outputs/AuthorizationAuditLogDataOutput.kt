package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditAction
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditLog
import java.time.ZonedDateTime

data class AuthorizationAuditLogDataOutput(
    val id: Int?,
    val actorEmail: String?,
    val action: AuthorizationAuditAction,
    val target: String,
    val details: Map<String, Any?>,
    val createdAtUtc: ZonedDateTime,
) {
    companion object {
        fun fromAuthorizationAuditLog(authorizationAuditLog: AuthorizationAuditLog) =
            AuthorizationAuditLogDataOutput(
                id = authorizationAuditLog.id,
                actorEmail = authorizationAuditLog.actorEmail,
                action = authorizationAuditLog.action,
                target = authorizationAuditLog.target,
                details = authorizationAuditLog.details,
                createdAtUtc = authorizationAuditLog.createdAtUtc,
            )
    }
}
