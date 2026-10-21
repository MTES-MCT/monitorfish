package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.AuthorizedOrganizationalUnitRepository

@UseCase
class GetAllAuthorizedOrganizationalUnits(
    private val authorizedOrganizationalUnitRepository: AuthorizedOrganizationalUnitRepository,
) {
    fun execute(): List<String> = authorizedOrganizationalUnitRepository.findAll()
}
