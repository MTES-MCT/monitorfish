package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.transaction.annotation.Transactional

class JpaGearRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaGearRepository: JpaGearRepository

    @Autowired
    lateinit var cacheManager: CacheManager

    @BeforeEach
    fun setup() {
        cacheManager.getCache("gear")?.clear()
        cacheManager.getCache("gears")?.clear()
    }

    @Test
    @Transactional
    fun `findAll Should return all gears`() {
        // When
        val gears = jpaGearRepository.findAll()

        assertThat(gears).hasSize(83)
        assertThat(gears.first().code).isEqualTo("MIS")
        assertThat(gears.first().name).isEqualTo("Engin divers")
        assertThat(gears.first().category).isEqualTo("Engin inconnu")
    }

    @Test
    @Transactional
    fun `find Should return a gear`() {
        // When
        val gear = jpaGearRepository.findByCode("OTB")

        assertThat(gear.name).isEqualTo("Chaluts de fond à panneaux")
    }

    @Test
    @Transactional
    fun `find Should throw an exception When there is no gear found`() {
        // When
        val throwable = catchThrowable { jpaGearRepository.findByCode("BAD_GEAR") }

        assertThat(throwable).isInstanceOf(CodeNotFoundException::class.java)
    }
}
