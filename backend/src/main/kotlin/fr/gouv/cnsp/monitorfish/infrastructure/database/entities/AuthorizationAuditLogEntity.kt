package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditAction
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditLog
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.Type
import java.time.ZonedDateTime

@Entity
@Table(name = "authorization_audit_logs")
data class AuthorizationAuditLogEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", unique = true, nullable = false)
    val id: Int? = null,
    @Column(name = "actor_email", nullable = true)
    val actorEmail: String?,
    @Column(name = "action", nullable = false)
    @Enumerated(EnumType.STRING)
    val action: AuthorizationAuditAction,
    @Column(name = "target", nullable = false)
    val target: String,
    @Type(JsonBinaryType::class)
    @Column(name = "details", nullable = false, columnDefinition = "jsonb")
    val details: Map<String, Any?>,
    @Column(name = "created_at_utc", nullable = false)
    val createdAtUtc: ZonedDateTime,
) {
    fun toAuthorizationAuditLog() =
        AuthorizationAuditLog(
            id = id,
            actorEmail = actorEmail,
            action = action,
            target = target,
            details = details,
            createdAtUtc = createdAtUtc,
        )

    companion object {
        fun fromAuthorizationAuditLog(authorizationAuditLog: AuthorizationAuditLog) =
            AuthorizationAuditLogEntity(
                id = authorizationAuditLog.id,
                actorEmail = authorizationAuditLog.actorEmail,
                action = authorizationAuditLog.action,
                target = authorizationAuditLog.target,
                details = authorizationAuditLog.details,
                createdAtUtc = authorizationAuditLog.createdAtUtc,
            )
    }
}
