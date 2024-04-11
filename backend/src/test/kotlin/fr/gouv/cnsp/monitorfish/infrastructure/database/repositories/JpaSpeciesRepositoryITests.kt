package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.transaction.annotation.Transactional

class JpaSpeciesRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaSpeciesRepository: JpaSpeciesRepository

    @Autowired
    lateinit var cacheManager: CacheManager

    @BeforeEach
    fun setup() {
        cacheManager.getCache("all_species")?.clear()
        cacheManager.getCache("species")?.clear()
    }

    @Test
    @Transactional
    fun `findAll Should return all species`() {
        // When
        val gears = jpaSpeciesRepository.findAll()

        assertThat(gears).hasSize(12459)
        assertThat(gears.first().code).isEqualTo("COD")
        assertThat(gears.first().name).isEqualTo("MORUE COMMUNE (CABILLAUD)")
    }

    @Test
    @Transactional
    fun `find Should return a species`() {
        // When
        val gear = jpaSpeciesRepository.findByCode("OTB")

        assertThat(gear.name).isEqualTo("OTOLITHOIDES BIAURITUS")
    }

    @Test
    @Transactional
    fun `find Should throw an exception When there is no species found`() {
        // When
        val throwable = catchThrowable { jpaSpeciesRepository.findByCode("BAD_SPECIES") }

        assertThat(throwable).isInstanceOf(CodeNotFoundException::class.java)
    }
}
