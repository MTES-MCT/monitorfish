package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditAction
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditLog
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.AuthorizationAuditLogRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.findByHashedEmailOrNull
import org.springframework.transaction.annotation.Transactional

@UseCase
class UpdateUserIsAdministrator(
    private val userAuthorizationRepository: UserAuthorizationRepository,
    private val authorizationAuditLogRepository: AuthorizationAuditLogRepository,
) {
    @Transactional
    fun execute(
        hashedEmail: String,
        isAdministrator: Boolean,
        actorEmail: String?,
    ) {
        val user =
            userAuthorizationRepository.findByHashedEmailOrNull(hashedEmail)
                ?: throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND, "User not found")

        if (isAdministrator && !user.isSuperUser) {
            throw BackendUsageException(BackendUsageErrorCode.COULD_NOT_UPDATE, "Only a CNSP user can be administrator")
        }
        if (!isAdministrator && actorEmail != null && hash(actorEmail) == hashedEmail) {
            throw BackendUsageException(
                BackendUsageErrorCode.COULD_NOT_UPDATE,
                "An administrator can't remove its own administrator rights",
            )
        }
        if (!isAdministrator && isLastAdministrator(userAuthorizationRepository, user)) {
            throw BackendUsageException(
                BackendUsageErrorCode.COULD_NOT_UPDATE,
                "The administrator rights of the last administrator can't be removed",
            )
        }

        userAuthorizationRepository.upsert(user.copy(isAdministrator = isAdministrator))
        authorizationAuditLogRepository.save(
            AuthorizationAuditLog(
                actorEmail = actorEmail,
                action = AuthorizationAuditAction.UPDATE_USER_IS_ADMINISTRATOR,
                target = user.email ?: hashedEmail,
                details = mapOf("isAdministrator" to isAdministrator),
            ),
        )
    }
}

internal fun isLastAdministrator(
    userAuthorizationRepository: UserAuthorizationRepository,
    user: UserAuthorization,
): Boolean {
    if (!user.isSuperUser || !user.isAdministrator) {
        return false
    }

    return userAuthorizationRepository.findAll().none {
        it.hashedEmail != user.hashedEmail && it.isSuperUser && it.isAdministrator
    }
}
