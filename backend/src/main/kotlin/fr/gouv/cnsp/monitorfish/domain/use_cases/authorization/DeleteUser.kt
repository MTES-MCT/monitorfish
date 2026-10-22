package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditAction
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditLog
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.AuthorizationAuditLogRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository
import org.springframework.transaction.annotation.Transactional

@UseCase
class DeleteUser(
    private val userAuthorizationRepository: UserAuthorizationRepository,
    private val authorizationAuditLogRepository: AuthorizationAuditLogRepository,
) {
    @Transactional
    fun execute(email: String) {
        val hashedEmail = hash(email)

        userAuthorizationRepository.delete(hashedEmail)
        // Called with the API key: there is no logged user
        authorizationAuditLogRepository.save(
            AuthorizationAuditLog(
                actorEmail = null,
                action = AuthorizationAuditAction.DELETE_USER,
                target = email.trim().lowercase(),
            ),
        )
    }
}
