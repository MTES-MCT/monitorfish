package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditAction
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditLog
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.ExternalAdministration
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.AuthorizationAuditLogRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository
import org.springframework.transaction.annotation.Transactional

/**
 * Used during the authorizations review. Super users are left untouched, and users of another administration are moved.
 */
@UseCase
class ReplaceAdministrationUsers(
    private val userAuthorizationRepository: UserAuthorizationRepository,
    private val authorizationAuditLogRepository: AuthorizationAuditLogRepository,
) {
    @Transactional
    fun execute(
        administration: ExternalAdministration,
        emails: List<String>,
        isEmptyListConfirmed: Boolean,
        actorEmail: String?,
    ): ReplacedAdministrationUsers {
        val normalizedEmails = emails.map { it.trim().lowercase() }.filter { it.isNotEmpty() }.distinct()
        if (normalizedEmails.isEmpty() && !isEmptyListConfirmed) {
            throw BackendUsageException(
                BackendUsageErrorCode.COULD_NOT_UPDATE,
                "An empty list would remove all the users of the administration: it must be confirmed.",
            )
        }
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

        val movedHashedEmails =
            hashedEmails.keys
                .filter { usersByHashedEmail[it]?.isInAnotherAdministrationThan(administration) == true }
                .toSet()
        val addedHashedEmails = hashedEmails.keys - currentHashedEmails - superUserHashedEmails - movedHashedEmails
        val upsertedUsers =
            hashedEmails
                .filterKeys { it !in superUserHashedEmails }
                .filterKeys { usersByHashedEmail[it]?.isUpToDateIn(administration) != true }
                .map { (hashedEmail, email) ->
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

        val replacedAdministrationUsers =
            ReplacedAdministrationUsers(
                addedEmails = addedHashedEmails.mapNotNull { hashedEmails[it] }.sorted(),
                movedEmails = movedHashedEmails.mapNotNull { hashedEmails[it] }.sorted(),
                removedEmails =
                    currentUsers.filter { it.hashedEmail in removedHashedEmails }.map {
                        it.email
                            ?: it.hashedEmail
                    },
                ignoredSuperUserEmails = superUserHashedEmails.mapNotNull { hashedEmails[it] }.sorted(),
            )
        authorizationAuditLogRepository.save(
            AuthorizationAuditLog(
                actorEmail = actorEmail,
                action = AuthorizationAuditAction.REPLACE_ADMINISTRATION_USERS,
                target = administration.name,
                details =
                    mapOf(
                        "addedEmails" to replacedAdministrationUsers.addedEmails,
                        "movedEmails" to replacedAdministrationUsers.movedEmails,
                        "removedEmails" to replacedAdministrationUsers.removedEmails,
                    ),
            ),
        )

        return replacedAdministrationUsers
    }
}

private fun UserAuthorization.isInAnotherAdministrationThan(administration: ExternalAdministration) =
    !isSuperUser && this.administration != null && this.administration != administration

private fun UserAuthorization.isUpToDateIn(administration: ExternalAdministration) =
    this.administration == administration && email != null

internal val EMAIL_REGEX = Regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")

data class ReplacedAdministrationUsers(
    val addedEmails: List<String>,
    val movedEmails: List<String>,
    val removedEmails: List<String>,
    val ignoredSuperUserEmails: List<String>,
)
