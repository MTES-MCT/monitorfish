package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.repositories.AuthorizedOrganizationalUnitRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.AuthorizedOrganizationalUnitEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBAuthorizedOrganizationalUnitRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Repository

@Repository
class JpaAuthorizedOrganizationalUnitRepository(
    private val dbAuthorizedOrganizationalUnitRepository: DBAuthorizedOrganizationalUnitRepository,
) : AuthorizedOrganizationalUnitRepository {
    override fun findAll(): List<String> =
        dbAuthorizedOrganizationalUnitRepository.findAll().map { it.organizationalUnit }.sorted()

    @Transactional
    override fun save(organizationalUnit: String) {
        dbAuthorizedOrganizationalUnitRepository.save(AuthorizedOrganizationalUnitEntity(organizationalUnit))
    }

    @Transactional
    override fun delete(organizationalUnit: String) {
        dbAuthorizedOrganizationalUnitRepository.deleteById(organizationalUnit)
    }
}
