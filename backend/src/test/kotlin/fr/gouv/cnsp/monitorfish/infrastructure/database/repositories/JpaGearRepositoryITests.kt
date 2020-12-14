package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.annotation.Transactional

@RunWith(SpringRunner::class)
class JpaGearRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaGearRepository: JpaGearRepository

    @Autowired
    lateinit var cacheManager: CacheManager

    @BeforeEach
    fun setup() {
        cacheManager.getCache("gear")?.clear()
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
}
