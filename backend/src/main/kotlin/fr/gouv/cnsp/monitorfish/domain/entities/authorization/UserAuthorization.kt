package fr.gouv.cnsp.monitorfish.domain.entities.authorization

data class UserAuthorization(
    val hashedEmail: String,
    val isSuperUser: Boolean,
)
