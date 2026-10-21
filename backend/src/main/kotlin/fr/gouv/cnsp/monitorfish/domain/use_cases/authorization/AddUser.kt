package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.ExternalAdministration
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository

/**
 * Adds a CNSP user (super user, with an optional service, possibly administrator) or an external user (attached to an administration).
 */
@UseCase
class AddUser(
    private val userAuthorizationRepository: UserAuthorizationRepository,
) {
    fun execute(
        email: String,
        isSuperUser: Boolean,
        isAdministrator: Boolean,
        service: CnspService?,
        administration: ExternalAdministration?,
    ) {
        val normalizedEmail = email.trim().lowercase()
        if (!EMAIL_REGEX.matches(normalizedEmail)) {
            throw BackendUsageException(BackendUsageErrorCode.COULD_NOT_UPDATE, "Invalid email: $normalizedEmail")
        }
        if (isSuperUser && administration != null) {
            throw BackendUsageException(BackendUsageErrorCode.COULD_NOT_UPDATE, "A CNSP user has no administration")
        }
        if (!isSuperUser && (administration == null || service != null || isAdministrator)) {
            throw BackendUsageException(
                BackendUsageErrorCode.COULD_NOT_UPDATE,
                "An external user requires an administration, and has no CNSP service nor administrator rights",
            )
        }

        val hashedEmail = hash(normalizedEmail)
        val isAlreadyRegistered =
            try {
                userAuthorizationRepository.findByHashedEmail(hashedEmail)
                true
            } catch (_: Throwable) {
                false
            }
        if (isAlreadyRegistered) {
            throw BackendUsageException(BackendUsageErrorCode.COULD_NOT_UPDATE, "User already exists: $normalizedEmail")
        }

        userAuthorizationRepository.upsert(
            UserAuthorization(
                hashedEmail = hashedEmail,
                email = normalizedEmail,
                isSuperUser = isSuperUser,
                service = service,
                isAdministrator = isAdministrator,
                administration = administration,
            ),
        )
    }
}
