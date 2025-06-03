package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "user_authorizations")
data class UserAuthorizationEntity(
    @Id
    @Column(name = "hashed_email", nullable = false)
    val hashedEmail: String,
    @Column(name = "is_super_user", nullable = false)
    val isSuperUser: Boolean,
    @Column(name = "service", nullable = true, columnDefinition = "cnsp_service")
    val service: String?,
    @Column(name = "is_administrator", nullable = false)
    val isAdministrator: Boolean,
) {
    fun toUserAuthorization() =
        UserAuthorization(
            hashedEmail = hashedEmail,
            isSuperUser = isSuperUser,
            service = service?.let { CnspService.fromValue(it) },
            isAdministrator = isAdministrator,
        )

    companion object {
        fun fromUserAuthorization(user: UserAuthorization) =
            UserAuthorizationEntity(
                hashedEmail = user.hashedEmail,
                isSuperUser = user.isSuperUser,
                service = user.service?.value,
                isAdministrator = user.isAdministrator,
            )
    }
}
