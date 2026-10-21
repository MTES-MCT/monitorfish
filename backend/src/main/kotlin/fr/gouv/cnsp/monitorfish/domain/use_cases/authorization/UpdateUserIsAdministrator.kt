package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository

/**
 * Only CNSP users (super users) can be administrators, and administrators can't remove their own rights
 * so that user management is never left without administrator.
 */
@UseCase
class UpdateUserIsAdministrator(
    private val userAuthorizationRepository: UserAuthorizationRepository,
) {
    fun execute(
        hashedEmail: String,
        isAdministrator: Boolean,
        currentUserEmail: String?,
    ) {
        val user =
            try {
                userAuthorizationRepository.findByHashedEmail(hashedEmail)
            } catch (_: Throwable) {
                throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND, "User not found")
            }

        if (isAdministrator && !user.isSuperUser) {
            throw BackendUsageException(BackendUsageErrorCode.COULD_NOT_UPDATE, "Only a CNSP user can be administrator")
        }
        if (!isAdministrator && currentUserEmail != null && hash(currentUserEmail.lowercase()) == hashedEmail) {
            throw BackendUsageException(
                BackendUsageErrorCode.COULD_NOT_UPDATE,
                "An administrator can't remove its own administrator rights",
            )
        }

        userAuthorizationRepository.upsert(user.copy(isAdministrator = isAdministrator))
    }
}
