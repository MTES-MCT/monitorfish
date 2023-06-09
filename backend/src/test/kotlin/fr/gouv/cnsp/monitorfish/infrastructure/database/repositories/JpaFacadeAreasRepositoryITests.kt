package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.repositories.FacadeAreasRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaFacadeAreasRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var facadeAreasRepository: FacadeAreasRepository

    @Test
    @Transactional
    fun `findByIncluding Should return all facade areas including the specified point geometry`() {
        // When
        val point = GeometryFactory().createPoint(Coordinate(-10.8558547, 53.3543093))
        val faoAreas = facadeAreasRepository.findByIncluding(point)

        assertThat(faoAreas).hasSize(1)
        assertThat(faoAreas.first().facade).isEqualTo("27.7")
        assertThat(faoAreas.last().geometry).isNotNull()
    }
}
