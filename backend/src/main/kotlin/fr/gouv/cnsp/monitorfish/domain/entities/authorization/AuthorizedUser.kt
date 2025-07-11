package fr.gouv.cnsp.monitorfish.domain.entities.authorization

data class AuthorizedUser(
    val email: String,
    val isSuperUser: Boolean,
    val service: CnspService?,
) {
    companion object {
        fun fromUserAuthorization(
            userAuthorization: UserAuthorization,
            email: String,
        ): AuthorizedUser =
            AuthorizedUser(
                email = email,
                isSuperUser = userAuthorization.isSuperUser,
                service = userAuthorization.service,
            )
    }
}
