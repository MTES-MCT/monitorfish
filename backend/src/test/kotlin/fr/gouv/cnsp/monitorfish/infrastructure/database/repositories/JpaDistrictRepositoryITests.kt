package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.transaction.annotation.Transactional

class JpaDistrictRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaDistrictRepository: JpaDistrictRepository

    @Autowired
    lateinit var cacheManager: CacheManager

    @BeforeEach
    fun setup() {
        cacheManager.getCache("district")?.clear()
    }

    @Test
    @Transactional
    fun `find Should return a district`() {
        // When
        val district = jpaDistrictRepository.find("PL")

        // Then
        assertThat(district.district).isEqualTo("Paimpol")
        assertThat(district.departmentCode).isEqualTo("22")
        assertThat(district.department).isEqualTo("Côtes d'Armor")
        assertThat(district.dml).isEqualTo("DML 22")
        assertThat(district.facade).isEqualTo("NAMO")
    }

    @Test
    @Transactional
    fun `find Should throw an exception When there is no district found`() {
        // When
        val throwable = catchThrowable { jpaDistrictRepository.find("BAD_DISTRICT") }

        assertThat(throwable).isInstanceOf(CodeNotFoundException::class.java)
    }
}
