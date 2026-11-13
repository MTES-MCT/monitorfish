package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.ExternalAdministration
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import java.time.ZonedDateTime

data class UserAuthorizationDataOutput(
    val hashedEmail: String,
    val email: String?,
    val isSuperUser: Boolean,
    val service: String?,
    val isAdministrator: Boolean,
    val administration: ExternalAdministration?,
    val lastLoginAtUtc: ZonedDateTime?,
) {
    companion object {
        fun fromUserAuthorization(user: UserAuthorization) =
            UserAuthorizationDataOutput(
                hashedEmail = user.hashedEmail,
                email = user.email,
                isSuperUser = user.isSuperUser,
                service = user.service?.value,
                isAdministrator = user.isAdministrator,
                administration = user.administration,
                lastLoginAtUtc = user.lastLoginAtUtc,
            )
    }
}
