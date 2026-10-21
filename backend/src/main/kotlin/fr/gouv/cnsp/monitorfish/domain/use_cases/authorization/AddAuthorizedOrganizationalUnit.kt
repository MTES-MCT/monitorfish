package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.AuthorizedOrganizationalUnitRepository

@UseCase
class AddAuthorizedOrganizationalUnit(
    private val authorizedOrganizationalUnitRepository: AuthorizedOrganizationalUnitRepository,
) {
    fun execute(organizationalUnit: String) {
        val normalizedOrganizationalUnit = organizationalUnit.trim().trimEnd('/')
        if (normalizedOrganizationalUnit.isEmpty()) {
            throw BackendUsageException(BackendUsageErrorCode.COULD_NOT_UPDATE, "Organizational unit is empty.")
        }

        authorizedOrganizationalUnitRepository.save(normalizedOrganizationalUnit)
    }
}
