package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaEezAreasRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaEezAreasRepository: JpaEezAreasRepository

    @Test
    @Transactional
    fun `intersect Should return true when point is inside`() {
        val point = GeometryFactory().createPoint(Coordinate(-3.0, 46.0))
        val result = jpaEezAreasRepository.intersectWithFrenchEez(point)
        assertThat(result).isTrue()
    }

    @Test
    @Transactional
    fun `intersect Should return false when point is not in French EEZ`() {
        val point = GeometryFactory().createPoint(Coordinate(5.0, 52.0))
        val result = jpaEezAreasRepository.intersectWithFrenchEez(point)
        assertThat(result).isFalse()
    }
}
