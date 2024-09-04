package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization

interface UserAuthorizationRepository {
    fun findByHashedEmail(hashedEmail: String): UserAuthorization

    fun save(user: UserAuthorization)

    fun delete(hashedEmail: String)
}
