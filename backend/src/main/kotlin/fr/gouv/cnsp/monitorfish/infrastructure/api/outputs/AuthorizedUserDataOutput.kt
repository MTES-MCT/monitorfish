package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizedUser

data class AuthorizedUserDataOutput(
    val email: String,
    val isSuperUser: Boolean,
) {
    companion object {
        fun fromUserAuthorization(authorizedUser: AuthorizedUser): AuthorizedUserDataOutput =
            AuthorizedUserDataOutput(
                email = authorizedUser.email ?: "",
                isSuperUser = authorizedUser.isSuperUser,
            )
    }
}
