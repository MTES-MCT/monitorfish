package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditAction
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditLog
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.AuthorizationAuditLogRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.AuthorizedOrganizationalUnitRepository
import org.springframework.transaction.annotation.Transactional

@UseCase
class AddAuthorizedOrganizationalUnit(
    private val authorizedOrganizationalUnitRepository: AuthorizedOrganizationalUnitRepository,
    private val authorizationAuditLogRepository: AuthorizationAuditLogRepository,
) {
    @Transactional
    fun execute(
        organizationalUnit: String,
        actorEmail: String?,
    ) {
        val normalizedOrganizationalUnit = normalizeOrganizationalUnit(organizationalUnit)
        if (normalizedOrganizationalUnit.isEmpty()) {
            throw BackendUsageException(BackendUsageErrorCode.COULD_NOT_UPDATE, "Organizational unit is empty.")
        }

        authorizedOrganizationalUnitRepository.save(normalizedOrganizationalUnit)
        authorizationAuditLogRepository.save(
            AuthorizationAuditLog(
                actorEmail = actorEmail,
                action = AuthorizationAuditAction.ADD_AUTHORIZED_ORGANIZATIONAL_UNIT,
                target = normalizedOrganizationalUnit,
            ),
        )
    }
}

internal fun normalizeOrganizationalUnit(organizationalUnit: String) = organizationalUnit.trim().trimEnd('/')
