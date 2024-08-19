package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.transaction.annotation.Transactional

class JpaFaoAreaRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaFAOAreaRepository: JpaFaoAreaRepository

    @Autowired
    lateinit var cacheManager: CacheManager

    @BeforeEach
    fun setup() {
        cacheManager.getCache("fao_areas")?.clear()
    }

    @Test
    @Transactional
    fun `findAll Should return all fao areas`() {
        // When
        val faoAreas = jpaFAOAreaRepository.findAll()

        // Then
        assertThat(faoAreas).hasSize(152)
        assertThat(faoAreas.first().faoCode).isEqualTo("18")
    }

    @Test
    @Transactional
    fun `findAllSortedByUsage Should return all fao areas sorted by usage`() {
        // When
        val faoAreas = jpaFAOAreaRepository.findAllSortedByUsage()

        // Then
        assertThat(faoAreas).hasSize(152)
        assertThat(faoAreas.first().faoCode).isEqualTo("21.1.C")
    }

    @Test
    @Transactional
    fun `findByIncluding Should return all fao areas including the specified point geometry`() {
        // When
        val point = GeometryFactory().createPoint(Coordinate(-10.8558547, 53.3543093))
        val faoAreas = jpaFAOAreaRepository.findByIncluding(point)

        // Then
        assertThat(faoAreas).hasSize(2)
        assertThat(faoAreas.first().faoCode).isEqualTo("27.7")
        assertThat(faoAreas.last().faoCode).isEqualTo("27.7.b")
    }
}
