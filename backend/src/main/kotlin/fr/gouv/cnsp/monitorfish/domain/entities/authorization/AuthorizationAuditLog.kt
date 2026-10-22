package fr.gouv.cnsp.monitorfish.domain.entities.authorization

import java.time.ZoneOffset
import java.time.ZonedDateTime

/**
 * Trace of a change of the users authorizations, kept for the authorizations review.
 * `actorEmail` is null when the change has been made with the API key (or when OIDC is disabled).
 */
data class AuthorizationAuditLog(
    val id: Int? = null,
    val actorEmail: String?,
    val action: AuthorizationAuditAction,
    val target: String,
    val details: Map<String, Any?> = mapOf(),
    val createdAtUtc: ZonedDateTime = ZonedDateTime.now(ZoneOffset.UTC),
)

enum class AuthorizationAuditAction {
    ADD_AUTHORIZED_ORGANIZATIONAL_UNIT,
    ADD_USER,
    DELETE_AUTHORIZED_ORGANIZATIONAL_UNIT,
    DELETE_USER,
    REPLACE_ADMINISTRATION_USERS,
    UPDATE_USER_IS_ADMINISTRATOR,
}
