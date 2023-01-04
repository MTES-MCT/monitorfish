package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.CreateOrUpdateFleetSegmentFields
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

class JpaFleetSegmentRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaFleetSegmentRepository: JpaFleetSegmentRepository

    @Autowired
    lateinit var cacheManager: CacheManager

    private val currentYear: Int

    init {
        val formatter = DateTimeFormatter.ofPattern("yyyy")
        currentYear = LocalDate.now().format(formatter).toInt()
    }

    @BeforeEach
    fun setup() {
        cacheManager.getCache("fleet_segments")?.clear()
    }

    @Test
    @Transactional
    fun `findAll Should return all fleet segments`() {
        // When
        val fleetSegments = jpaFleetSegmentRepository.findAll().sortedBy { it.segment }

        assertThat(fleetSegments).hasSize(66)
        assertThat(fleetSegments.first().segment).isEqualTo("ATL01")
        assertThat(fleetSegments.first().dirm).isEqualTo(listOf("MED", "SA", "NAMO", "MEMN"))
        assertThat(fleetSegments.first().gears).isEqualTo(
            listOf("OTM", "PTM")
        )
    }

    @Test
    @Transactional
    fun `update Should update a fleet segment key`() {
        // Given
        val currentYear = ZonedDateTime.now().year
        val fleetSegments = jpaFleetSegmentRepository.findAll().sortedBy { it.segment }

        assertThat(fleetSegments).hasSize(66)
        assertThat(fleetSegments.first().segment).isEqualTo("ATL01")

        // When
        val updatedFleetSegment = jpaFleetSegmentRepository.update(
            "ATL01",
            CreateOrUpdateFleetSegmentFields("NEXT_ATL01"),
            currentYear
        )

        // Then
        assertThat(updatedFleetSegment.segment).isEqualTo("NEXT_ATL01")
    }

    @Test
    @Transactional
    fun `update Should update a fleet segment name`() {
        // Given
        val currentYear = ZonedDateTime.now().year
        val fleetSegments = jpaFleetSegmentRepository.findAll().sortedBy { it.segment }

        assertThat(fleetSegments).hasSize(66)
        assertThat(fleetSegments.first().segmentName).isEqualTo("All Trawls 3")

        // When
        val updatedFleetSegment = jpaFleetSegmentRepository.update(
            "ATL01",
            CreateOrUpdateFleetSegmentFields(segmentName = "All Trawls 666"),
            currentYear
        )

        // Then
        assertThat(updatedFleetSegment.segmentName).isEqualTo("All Trawls 666")
    }

    @Test
    @Transactional
    fun `update Should update fleet segment gears`() {
        // Given
        val currentYear = ZonedDateTime.now().year
        val fleetSegments = jpaFleetSegmentRepository.findAll().sortedBy { it.segment }

        assertThat(fleetSegments).hasSize(66)
        assertThat(fleetSegments.first().segment).isEqualTo("ATL01")
        assertThat(fleetSegments.first().gears).isEqualTo(
            listOf("OTM", "PTM")
        )

        // When
        val updatedFleetSegment = jpaFleetSegmentRepository.update(
            "ATL01",
            CreateOrUpdateFleetSegmentFields(gears = listOf("OTB", "DOF")),
            currentYear
        )

        // Then
        assertThat(updatedFleetSegment.segment).isEqualTo("ATL01")
        assertThat(updatedFleetSegment.gears).isEqualTo(listOf("OTB", "DOF"))
    }

    @Test
    @Transactional
    fun `update Should update fleet segment FAO areas`() {
        // Given
        val currentYear = ZonedDateTime.now().year
        val fleetSegments = jpaFleetSegmentRepository.findAll().sortedBy { it.segment }

        assertThat(fleetSegments).hasSize(66)
        assertThat(fleetSegments.first().segment).isEqualTo("ATL01")
        assertThat(fleetSegments.first().faoAreas).isEqualTo(listOf("27.7", "27.8", "27.9", "27.10"))

        // When
        val updatedFleetSegment = jpaFleetSegmentRepository.update(
            "ATL01",
            CreateOrUpdateFleetSegmentFields(faoAreas = listOf("66.6.6", "66.6.7")),
            currentYear
        )

        // Then
        assertThat(updatedFleetSegment.segment).isEqualTo("ATL01")
        assertThat(updatedFleetSegment.faoAreas).isEqualTo(listOf("66.6.6", "66.6.7"))
    }

    @Test
    @Transactional
    fun `create Should insert a new fleet segment`() {
        // Given
        val fleetSegments = jpaFleetSegmentRepository.findAll()

        assertThat(fleetSegments).hasSize(66)

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
                year = currentYear + 1
            )
        )

        // Then
        val updatedFleetSegments = jpaFleetSegmentRepository.findAll()
        assertThat(updatedFleetSegments).hasSize(67)
        val createdFleetSegment = updatedFleetSegments.find { it.segment == "SEGMENT1" }
        assertThat(createdFleetSegment?.segmentName).isEqualTo("A NAME")
    }

    @Test
    @Transactional
    fun `findAllByYear Should find all fleet segments of the given year`() {
        // When
        val fleetSegments = jpaFleetSegmentRepository.findAllByYear(currentYear - 1)

        // Then
        assertThat(fleetSegments).hasSize(23)
    }

    @Test
    @Transactional
    fun `delete Should delete a fleet segment`() {
        // Given
        val fleetSegments = jpaFleetSegmentRepository.findAllByYear(currentYear - 1)
        val segmentToDelete = fleetSegments.first()

        // When
        jpaFleetSegmentRepository.delete(segmentToDelete.segment, currentYear - 1)

        // Then
        val expectedFleetSegment = jpaFleetSegmentRepository.findAllByYear(currentYear - 1)
        assertThat(expectedFleetSegment).hasSize(22)
        assertThat(expectedFleetSegment).doesNotContain(segmentToDelete)
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
        // Given
        val currentYear = ZonedDateTime.now().year

        // When
        val yearEntries = jpaFleetSegmentRepository.findYearEntries()

        // Then
        assertThat(yearEntries).hasSize(2)
        assertThat(yearEntries.first()).isEqualTo(currentYear)
        assertThat(yearEntries.last()).isEqualTo(currentYear - 1)
    }

    @Test
    @Transactional
    fun `addYear Should add a new year copied from the specified year`() {
        // Given
        assertThat(jpaFleetSegmentRepository.findAllByYear(currentYear - 1)).hasSize(23)
        assertThat(jpaFleetSegmentRepository.findAllByYear(currentYear + 1)).hasSize(0)

        // When
        jpaFleetSegmentRepository.addYear(currentYear - 1, currentYear + 1)

        // Then
        assertThat(jpaFleetSegmentRepository.findAllByYear(currentYear - 1)).hasSize(23)
        val updatedFleetSegments = jpaFleetSegmentRepository.findAllByYear(currentYear + 1).sortedBy { it.segment }
        assertThat(updatedFleetSegments).hasSize(23)
    }
}
