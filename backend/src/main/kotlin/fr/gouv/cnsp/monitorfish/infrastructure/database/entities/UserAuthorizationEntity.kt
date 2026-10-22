package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.ExternalAdministration
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.ZonedDateTime

@Entity
@Table(name = "user_authorizations")
data class UserAuthorizationEntity(
    @Id
    @Column(name = "hashed_email", nullable = false)
    val hashedEmail: String,
    @Column(name = "email", nullable = true)
    val email: String?,
    @Column(name = "is_super_user", nullable = false)
    val isSuperUser: Boolean,
    @Column(name = "service", nullable = true, columnDefinition = "cnsp_service")
    val service: String?,
    @Column(name = "is_administrator", nullable = false)
    val isAdministrator: Boolean,
    @Column(name = "administration", nullable = true, columnDefinition = "external_administration")
    val administration: String?,
    @Column(name = "last_login_at_utc", nullable = true)
    val lastLoginAtUtc: ZonedDateTime? = null,
    @Column(name = "idp_id", nullable = true)
    val idpId: String? = null,
    @Column(name = "sub", nullable = true)
    val sub: String? = null,
) {
    fun toUserAuthorization() =
        UserAuthorization(
            hashedEmail = hashedEmail,
            email = email,
            isSuperUser = isSuperUser,
            service = service?.let { CnspService.fromValue(it) },
            isAdministrator = isAdministrator,
            administration = administration?.let { ExternalAdministration.valueOf(it) },
            lastLoginAtUtc = lastLoginAtUtc,
            idpId = idpId,
            sub = sub,
        )

    companion object {
        fun fromUserAuthorization(user: UserAuthorization) =
            UserAuthorizationEntity(
                hashedEmail = user.hashedEmail,
                email = user.email,
                isSuperUser = user.isSuperUser,
                service = user.service?.value,
                isAdministrator = user.isAdministrator,
                administration = user.administration?.name,
            )
    }
}
