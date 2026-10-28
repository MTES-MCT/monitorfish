package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaAuthorizedOrganizationalUnitRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaAuthorizedOrganizationalUnitRepository: JpaAuthorizedOrganizationalUnitRepository

    @Test
    @Transactional
    fun `findAll Should return all authorized organizational units`() {
        // When
        val organizationalUnits = jpaAuthorizedOrganizationalUnitRepository.findAll()

        // Then
        assertThat(organizationalUnits).containsExactly("DAM/DIRM NAMO", "DAM/DPMA")
    }

    @Test
    @Transactional
    fun `save and delete Should add and remove an authorized organizational unit`() {
        // When
        jpaAuthorizedOrganizationalUnitRepository.save("DAM/DIRM MEMN")

        // Then
        assertThat(jpaAuthorizedOrganizationalUnitRepository.findAll()).contains("DAM/DIRM MEMN")

        // When
        jpaAuthorizedOrganizationalUnitRepository.delete("DAM/DIRM MEMN")

        // Then
        assertThat(jpaAuthorizedOrganizationalUnitRepository.findAll()).doesNotContain("DAM/DIRM MEMN")
    }
}
