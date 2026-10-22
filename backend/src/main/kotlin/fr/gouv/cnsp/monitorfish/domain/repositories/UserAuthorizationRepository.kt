package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import java.time.ZonedDateTime

interface UserAuthorizationRepository {
    fun findByHashedEmail(hashedEmail: String): UserAuthorization

    fun findAll(): List<UserAuthorization>

    fun upsert(user: UserAuthorization)

    fun upsertAll(users: List<UserAuthorization>)

    /**
     * Saves the login date, and binds the ProConnect identity (`idp_id`, `sub`) at the first login.
     * Also fills the email of users created before plain emails were stored.
     */
    fun saveLogin(
        hashedEmail: String,
        email: String,
        idpId: String?,
        sub: String?,
        loginDateUtc: ZonedDateTime,
    )

    fun delete(hashedEmail: String)

    fun deleteAll(hashedEmails: List<String>)
}
