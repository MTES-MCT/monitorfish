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

}
