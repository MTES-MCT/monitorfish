package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditAction
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditLog
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.AuthorizationAuditLogRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.findByHashedEmailOrNull
import org.springframework.transaction.annotation.Transactional

/** Users created before plain emails were stored can only be identified by their hashed email. */
@UseCase
class DeleteUserByHashedEmail(
    private val userAuthorizationRepository: UserAuthorizationRepository,
    private val authorizationAuditLogRepository: AuthorizationAuditLogRepository,
) {
    @Transactional
    fun execute(
        hashedEmail: String,
        actorEmail: String?,
    ) {
        val user =
            userAuthorizationRepository.findByHashedEmailOrNull(hashedEmail)
                ?: throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND, "User not found")

        if (actorEmail != null && hash(actorEmail) == hashedEmail) {
            throw BackendUsageException(BackendUsageErrorCode.COULD_NOT_UPDATE, "An administrator can't delete itself")
        }
        if (isLastAdministrator(userAuthorizationRepository, user)) {
            throw BackendUsageException(
                BackendUsageErrorCode.COULD_NOT_UPDATE,
                "The last administrator can't be deleted",
            )
        }

        userAuthorizationRepository.delete(hashedEmail)
        authorizationAuditLogRepository.save(
            AuthorizationAuditLog(
                actorEmail = actorEmail,
                action = AuthorizationAuditAction.DELETE_USER,
                target = user.email ?: hashedEmail,
                details = getUserAuditDetails(user),
            ),
        )
    }
}
