package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.CreateOrUpdateFleetSegmentFields
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.transaction.annotation.Transactional

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

        assertThat(fleetSegments).hasSize(66)
        assertThat(fleetSegments.first().segment).isEqualTo("SWW01/02/03")
        assertThat(fleetSegments.first().dirm).isEqualTo(listOf("NAMO", "SA"))
        assertThat(fleetSegments.first().gears).isEqualTo(
            listOf("OTB", "OTT", "PTB", "OT", "PT", "TBN", "TBS", "TX", "TB")
        )
    }

    @Test
    @Transactional
    fun `update Should update a fleet segment key`() {
        // Given
        val fleetSegments = jpaFleetSegmentRepository.findAll()

        assertThat(fleetSegments).hasSize(66)
        assertThat(fleetSegments.first().segment).isEqualTo("SWW01/02/03")

        // When
        val updatedFleetSegment = jpaFleetSegmentRepository.update(
            "SWW01/02/03",
            CreateOrUpdateFleetSegmentFields("NEXT_SWW01/02/03"),
            2022
        )

        // Then
        assertThat(updatedFleetSegment.segment).isEqualTo("NEXT_SWW01/02/03")
    }

    @Test
    @Transactional
    fun `update Should update a fleet segment name`() {
        // Given
        val fleetSegments = jpaFleetSegmentRepository.findAll()

        assertThat(fleetSegments).hasSize(66)
        assertThat(fleetSegments.first().segmentName).isEqualTo("Bottom trawls")

        // When
        val updatedFleetSegment = jpaFleetSegmentRepository.update(
            "SWW01/02/03",
            CreateOrUpdateFleetSegmentFields(segmentName = "Bottom trawls 666"),
            2022
        )

        // Then
        assertThat(updatedFleetSegment.segmentName).isEqualTo("Bottom trawls 666")
    }

    @Test
    @Transactional
    fun `update Should update fleet segment gears`() {
        // Given
        val fleetSegments = jpaFleetSegmentRepository.findAll()

        assertThat(fleetSegments).hasSize(66)
        assertThat(fleetSegments.first().segment).isEqualTo("SWW01/02/03")
        assertThat(fleetSegments.first().gears).isEqualTo(
            listOf("OTB", "OTT", "PTB", "OT", "PT", "TBN", "TBS", "TX", "TB")
        )

        // When
        val updatedFleetSegment = jpaFleetSegmentRepository.update(
            "SWW01/02/03",
            CreateOrUpdateFleetSegmentFields(gears = listOf("OTB", "DOF")),
            2022
        )

        // Then
        assertThat(updatedFleetSegment.segment).isEqualTo("SWW01/02/03")
        assertThat(updatedFleetSegment.gears).isEqualTo(listOf("OTB", "DOF"))
    }

    @Test
    @Transactional
    fun `update Should update fleet segment FAO areas`() {
        // Given
        val fleetSegments = jpaFleetSegmentRepository.findAll()

        assertThat(fleetSegments).hasSize(66)
        assertThat(fleetSegments.first().segment).isEqualTo("SWW01/02/03")
        assertThat(fleetSegments.first().faoAreas).isEqualTo(listOf("27.8.c", "27.8", "27.9"))

        // When
        val updatedFleetSegment = jpaFleetSegmentRepository.update(
            "SWW01/02/03",
            CreateOrUpdateFleetSegmentFields(faoAreas = listOf("66.6.6", "66.6.7")),
            2022
        )

        // Then
        assertThat(updatedFleetSegment.segment).isEqualTo("SWW01/02/03")
        assertThat(updatedFleetSegment.faoAreas).isEqualTo(listOf("66.6.6", "66.6.7"))
    }

    @Test
    @Transactional
    fun `create Should insert a new fleet segment`() {
        // Given
        val fleetSegments = jpaFleetSegmentRepository.findAll()

        assertThat(fleetSegments).hasSize(66)
        assertThat(fleetSegments.first().segment).isEqualTo("SWW01/02/03")
        assertThat(fleetSegments.first().faoAreas).isEqualTo(listOf("27.8.c", "27.8", "27.9"))

        // When
        jpaFleetSegmentRepository.create(
            FleetSegment(
                segment = "SEGMENT1",
                segmentName = "A NAME",
                dirm = listOf(),
                gears = listOf(),
                faoAreas = listOf(),
                targetSpecies = listOf(),
                bycatchSpecies = listOf(),
                impactRiskFactor = 2.3,
                year = 2023
            )
        )

        // Then
        val createdFleetSegment = jpaFleetSegmentRepository.findAll().find { it.segment == "SEGMENT1" }
        assertThat(createdFleetSegment?.segmentName).isEqualTo("A NAME")
    }

    @Test
    @Transactional
    fun `findAllByYear Should find all fleet segments of the given year`() {
        // When
        val fleetSegments = jpaFleetSegmentRepository.findAllByYear(2021)

        // Then
        assertThat(fleetSegments).hasSize(23)
    }

    @Test
    @Transactional
    fun `findAllByYear Should return no fleet segments When there is no objectives for a given year`() {
        // When
        val fleetSegments = jpaFleetSegmentRepository.findAllByYear(2020)

        // Then
        assertThat(fleetSegments).hasSize(0)
    }

    @Test
    @Transactional
    fun `findYearEntries Should return year entries`() {
        // When
        val yearEntries = jpaFleetSegmentRepository.findYearEntries()

        // Then
        assertThat(yearEntries).hasSize(2)
        assertThat(yearEntries.first()).isEqualTo(2022)
        assertThat(yearEntries.last()).isEqualTo(2021)
    }

    @Test
    @Transactional
    fun `addYear Should add a new year copied from the specified year`() {
        // Given
        assertThat(jpaFleetSegmentRepository.findAllByYear(2021)).hasSize(23)
        assertThat(jpaFleetSegmentRepository.findAllByYear(2023)).hasSize(0)

        // When
        jpaFleetSegmentRepository.addYear(2021, 2023)

        // Then
        assertThat(jpaFleetSegmentRepository.findAllByYear(2021)).hasSize(23)
        val updatedFleetSegments = jpaFleetSegmentRepository.findAllByYear(2023).sortedBy { it.segment }
        assertThat(updatedFleetSegments).hasSize(23)
    }
}
