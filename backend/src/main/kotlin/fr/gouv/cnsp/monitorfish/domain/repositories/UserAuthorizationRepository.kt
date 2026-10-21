package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import java.time.ZonedDateTime

interface UserAuthorizationRepository {
    fun findByHashedEmail(hashedEmail: String): UserAuthorization

    fun findAll(): List<UserAuthorization>

    fun upsert(user: UserAuthorization)

    fun upsertAll(users: List<UserAuthorization>)

    /** Saves the login date, and the email of users created before plain emails were stored. */
    fun saveLogin(
        hashedEmail: String,
        email: String,
        loginDateUtc: ZonedDateTime,
    )

    fun delete(hashedEmail: String)

    fun deleteAll(hashedEmails: List<String>)
}
