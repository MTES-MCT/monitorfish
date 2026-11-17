package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.API_KEY_ACTOR_EMAIL
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditAction
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditLog
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.ExternalAdministration
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.AuthorizationAuditLogRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository
import org.springframework.transaction.annotation.Transactional

@UseCase
class SaveUser(
    private val userAuthorizationRepository: UserAuthorizationRepository,
    private val authorizationAuditLogRepository: AuthorizationAuditLogRepository,
) {
    @Transactional
    fun execute(
        email: String,
        isSuperUser: Boolean,
        service: String?,
        isAdministrator: Boolean,
        administration: ExternalAdministration? = null,
    ) {
        val user =
            UserAuthorization(
                hashedEmail = hash(email),
                email = email.trim().lowercase(),
                isSuperUser = isSuperUser,
                service = service?.let { CnspService.fromValue(it) },
                isAdministrator = isAdministrator,
                administration = administration,
            )

        userAuthorizationRepository.upsert(user)
        authorizationAuditLogRepository.save(
            AuthorizationAuditLog(
                actorEmail = API_KEY_ACTOR_EMAIL,
                action = AuthorizationAuditAction.ADD_USER,
                target = user.email ?: user.hashedEmail,
                details = getUserAuditDetails(user),
            ),
        )
    }
}
