package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization

data class UserAuthorizationDataOutput(
    val isSuperUser: Boolean,
) {
    companion object {
        fun fromUserAuthorization(userAuthorization: UserAuthorization): UserAuthorizationDataOutput =
            UserAuthorizationDataOutput(
                isSuperUser = userAuthorization.isSuperUser,
            )
    }
}
