package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.ExternalAdministration
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository
import org.springframework.transaction.annotation.Transactional

/**
 * Replaces the users of an external administration by the given list of emails (used during the authorizations review).
 * Super users are never added nor removed by this use case.
 */
@UseCase
class ReplaceAdministrationUsers(
    private val userAuthorizationRepository: UserAuthorizationRepository,
) {
    @Transactional
    fun execute(
        administration: ExternalAdministration,
        emails: List<String>,
    ): ReplacedAdministrationUsers {
        val normalizedEmails = emails.map { it.trim().lowercase() }.filter { it.isNotEmpty() }.distinct()
        val invalidEmails = normalizedEmails.filterNot { EMAIL_REGEX.matches(it) }
        if (invalidEmails.isNotEmpty()) {
            throw BackendUsageException(
                BackendUsageErrorCode.COULD_NOT_UPDATE,
                "Invalid emails: ${invalidEmails.joinToString(", ")}",
            )
        }

        val hashedEmails = normalizedEmails.associateBy { hash(it) }
        val usersByHashedEmail = userAuthorizationRepository.findAll().associateBy { it.hashedEmail }
        val superUserHashedEmails = hashedEmails.keys.filter { usersByHashedEmail[it]?.isSuperUser == true }.toSet()

        val currentUsers = usersByHashedEmail.values.filter { it.administration == administration && !it.isSuperUser }
        val currentHashedEmails = currentUsers.map { it.hashedEmail }.toSet()

        val removedHashedEmails = currentHashedEmails - hashedEmails.keys
        userAuthorizationRepository.deleteAll(removedHashedEmails.toList())

        val addedHashedEmails = hashedEmails.keys - currentHashedEmails - superUserHashedEmails
        // Users already listed in this administration with their email are left untouched
        val upsertedUsers =
            hashedEmails
                .filterKeys { it !in superUserHashedEmails }
                .filter { (hashedEmail, _) ->
                    val existingUser = usersByHashedEmail[hashedEmail]

                    existingUser == null || existingUser.administration != administration || existingUser.email == null
                }.map { (hashedEmail, email) ->
                    UserAuthorization(
                        hashedEmail = hashedEmail,
                        email = email,
                        isSuperUser = false,
                        service = null,
                        isAdministrator = false,
                        administration = administration,
                    )
                }
        userAuthorizationRepository.upsertAll(upsertedUsers)

        return ReplacedAdministrationUsers(
            addedEmails = addedHashedEmails.mapNotNull { hashedEmails[it] }.sorted(),
            removedEmails =
                currentUsers.filter { it.hashedEmail in removedHashedEmails }.map {
                    it.email
                        ?: it.hashedEmail
                },
            ignoredSuperUserEmails = superUserHashedEmails.mapNotNull { hashedEmails[it] }.sorted(),
        )
    }
}

internal val EMAIL_REGEX = Regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")

data class ReplacedAdministrationUsers(
    val addedEmails: List<String>,
    val removedEmails: List<String>,
    val ignoredSuperUserEmails: List<String>,
)
