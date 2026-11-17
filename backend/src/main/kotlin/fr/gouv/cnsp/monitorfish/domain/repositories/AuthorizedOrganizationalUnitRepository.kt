package fr.gouv.cnsp.monitorfish.domain.repositories

interface AuthorizedOrganizationalUnitRepository {
    fun findAll(): List<String>

    fun save(organizationalUnit: String)

    fun delete(organizationalUnit: String)
}
