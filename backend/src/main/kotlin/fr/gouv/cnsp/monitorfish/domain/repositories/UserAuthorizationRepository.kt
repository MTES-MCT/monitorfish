package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import java.time.ZonedDateTime

interface UserAuthorizationRepository {
    fun findByHashedEmail(hashedEmail: String): UserAuthorization

    fun findAll(): List<UserAuthorization>

    fun upsert(user: UserAuthorization)

    fun upsertAll(users: List<UserAuthorization>)

    /** Only the first login binds the ProConnect identity, and fills the email of users created before it was stored. */
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

fun UserAuthorizationRepository.findByHashedEmailOrNull(hashedEmail: String): UserAuthorization? =
    try {
        findByHashedEmail(hashedEmail)
    } catch (_: Throwable) {
        null
    }
