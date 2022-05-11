package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.UpdateFleetSegmentFields
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.annotation.Transactional

@RunWith(SpringRunner::class)
class JpaFleetSegmentRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaFleetSegmentRepository: JpaFleetSegmentRepository

    @Autowired
    lateinit var cacheManager: CacheManager

    @BeforeEach
    fun setup() {
        cacheManager.getCache("fleet_segments")?.clear()
    }

    @Test
    @Transactional
    fun `findAll Should return all fleet segments`() {
        // When
        val fleetSegments = jpaFleetSegmentRepository.findAll()

        assertThat(fleetSegments).hasSize(43)
        assertThat(fleetSegments.first().segment).isEqualTo("SWW01/02/03")
        assertThat(fleetSegments.first().dirm).isEqualTo(listOf("NAMO", "SA"))
        assertThat(fleetSegments.first().gears).isEqualTo(listOf("OTB", "OTT", "PTB", "OT", "PT", "TBN", "TBS", "TX", "TB"))
    }

    @Test
    @Transactional
    fun `update Should update a fleet segment key`() {
        // Given
        val fleetSegments = jpaFleetSegmentRepository.findAll()

        assertThat(fleetSegments).hasSize(43)
        assertThat(fleetSegments.first().segment).isEqualTo("SWW01/02/03")

        // When
        val updatedFleetSegment = jpaFleetSegmentRepository.update("SWW01/02/03", UpdateFleetSegmentFields("NEXT_SWW01/02/03"))

        // Then
        assertThat(updatedFleetSegment.segment).isEqualTo("NEXT_SWW01/02/03")
    }

    @Test
    @Transactional
    fun `update Should update a fleet segment name`() {
        // Given
        val fleetSegments = jpaFleetSegmentRepository.findAll()

        assertThat(fleetSegments).hasSize(43)
        assertThat(fleetSegments.first().segmentName).isEqualTo("Bottom trawls")

        // When
        val updatedFleetSegment = jpaFleetSegmentRepository.update("SWW01/02/03", UpdateFleetSegmentFields(segmentName = "Bottom trawls 666"))

        // Then
        assertThat(updatedFleetSegment.segmentName).isEqualTo("Bottom trawls 666")
    }

    @Test
    @Transactional
    fun `update Should update fleet segment gears`() {
        // Given
        val fleetSegments = jpaFleetSegmentRepository.findAll()

        assertThat(fleetSegments).hasSize(43)
        assertThat(fleetSegments.first().segment).isEqualTo("SWW01/02/03")
        assertThat(fleetSegments.first().gears).isEqualTo(listOf("OTB", "OTT", "PTB", "OT", "PT", "TBN", "TBS", "TX", "TB"))

        // When
        val updatedFleetSegment = jpaFleetSegmentRepository.update("SWW01/02/03", UpdateFleetSegmentFields(gears = listOf("OTB", "DOF")))

        // Then
        assertThat(updatedFleetSegment.segment).isEqualTo("SWW01/02/03")
        assertThat(updatedFleetSegment.gears).isEqualTo(listOf("OTB", "DOF"))
    }

    @Test
    @Transactional
    fun `update Should update fleet segment FAO areas`() {
        // Given
        val fleetSegments = jpaFleetSegmentRepository.findAll()

        assertThat(fleetSegments).hasSize(43)
        assertThat(fleetSegments.first().segment).isEqualTo("SWW01/02/03")
        assertThat(fleetSegments.first().faoAreas).isEqualTo(listOf("27.8.c", "27.8", "27.9"))

        // When
        val updatedFleetSegment = jpaFleetSegmentRepository.update("SWW01/02/03", UpdateFleetSegmentFields(faoAreas = listOf("66.6.6", "66.6.7")))

        // Then
        assertThat(updatedFleetSegment.segment).isEqualTo("SWW01/02/03")
        assertThat(updatedFleetSegment.faoAreas).isEqualTo(listOf("66.6.6", "66.6.7"))
    }
}
