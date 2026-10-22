package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditAction
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditLog
import fr.gouv.cnsp.monitorfish.domain.repositories.AuthorizationAuditLogRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.AuthorizedOrganizationalUnitRepository
import org.springframework.transaction.annotation.Transactional

@UseCase
class DeleteAuthorizedOrganizationalUnit(
    private val authorizedOrganizationalUnitRepository: AuthorizedOrganizationalUnitRepository,
    private val authorizationAuditLogRepository: AuthorizationAuditLogRepository,
) {
    @Transactional
    fun execute(
        organizationalUnit: String,
        actorEmail: String?,
    ) {
        val normalizedOrganizationalUnit = normalizeOrganizationalUnit(organizationalUnit)

        authorizedOrganizationalUnitRepository.delete(normalizedOrganizationalUnit)
        authorizationAuditLogRepository.save(
            AuthorizationAuditLog(
                actorEmail = actorEmail,
                action = AuthorizationAuditAction.DELETE_AUTHORIZED_ORGANIZATIONAL_UNIT,
                target = normalizedOrganizationalUnit,
            ),
        )
    }
}
