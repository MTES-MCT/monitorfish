package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.CreateOrUpdateFleetSegmentFields
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime
import kotlin.properties.Delegates

class JpaFleetSegmentRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaFleetSegmentRepository: JpaFleetSegmentRepository

    @Autowired
    lateinit var cacheManager: CacheManager

    // https://stackoverflow.com/a/44386513/2736233
    private var currentYear by Delegates.notNull<Int>()

    init {
        currentYear = ZonedDateTime.now().year
    }

    @BeforeEach
    fun setup() {
        cacheManager.getCache("fleet_segments")?.clear()
        cacheManager.getCache("current_segments")?.clear()
        cacheManager.getCache("segments_by_year")?.clear()
    }

    @Test
    @Transactional
    fun `findAll Should return all fleet segments`() {
        // When
        cacheManager.getCache("segments_by_year")?.clear()
        val fleetSegments = jpaFleetSegmentRepository.findAllByYear(currentYear).sortedBy { it.segment }

        assertThat(fleetSegments).hasSize(67)
        assertThat(fleetSegments.first().segment).isEqualTo("ATL01")
        assertThat(fleetSegments.first().gears).isEqualTo(
            listOf("OTM", "PTM"),
        )
    }

    @Test
    @Transactional
    fun `update Should update a fleet segment key`() {
        // Given
        val currentYear = ZonedDateTime.now().year
        cacheManager.getCache("segments_by_year")?.clear()
        val fleetSegments = jpaFleetSegmentRepository.findAllByYear(currentYear).sortedBy { it.segment }

        assertThat(fleetSegments).hasSize(67)
        assertThat(fleetSegments.first().segment).isEqualTo("ATL01")

        // When
        val updatedFleetSegment =
            jpaFleetSegmentRepository.update(
                "ATL01",
                CreateOrUpdateFleetSegmentFields("NEXT_ATL01", "A segment name"),
                currentYear,
            )

        // Then
        assertThat(updatedFleetSegment.segment).isEqualTo("NEXT_ATL01")
        assertThat(updatedFleetSegment.segmentName).isEqualTo("A segment name")
    }

    @Test
    @Transactional
    fun `update Should update a fleet segment name`() {
        // Given
        val currentYear = ZonedDateTime.now().year
        cacheManager.getCache("segments_by_year")?.clear()
        val fleetSegments = jpaFleetSegmentRepository.findAllByYear(currentYear).sortedBy { it.segment }

        assertThat(fleetSegments).hasSize(67)
        assertThat(fleetSegments.first().segmentName).isEqualTo("ATL01")

        // When
        val updatedFleetSegment =
            jpaFleetSegmentRepository.update(
                "ATL01",
                CreateOrUpdateFleetSegmentFields(segmentName = "All Trawls 676"),
                currentYear,
            )

        // Then
        assertThat(updatedFleetSegment.segmentName).isEqualTo("All Trawls 676")
    }

    @Test
    @Transactional
    fun `update Should update fleet segment gears`() {
        // Given
        val currentYear = ZonedDateTime.now().year
        cacheManager.getCache("segments_by_year")?.clear()
        val fleetSegments = jpaFleetSegmentRepository.findAllByYear(currentYear).sortedBy { it.segment }

        assertThat(fleetSegments).hasSize(67)
        assertThat(fleetSegments.first().segment).isEqualTo("ATL01")
        assertThat(fleetSegments.first().gears).isEqualTo(
            listOf("OTM", "PTM"),
        )

        // When
        val updatedFleetSegment =
            jpaFleetSegmentRepository.update(
                "ATL01",
                CreateOrUpdateFleetSegmentFields(gears = listOf("OTB", "DOF")),
                currentYear,
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
        cacheManager.getCache("segments_by_year")?.clear()
        val fleetSegments = jpaFleetSegmentRepository.findAllByYear(currentYear).sortedBy { it.segment }

        assertThat(fleetSegments).hasSize(67)
        assertThat(fleetSegments.first().segment).isEqualTo("ATL01")
        assertThat(fleetSegments.first().faoAreas).isEqualTo(listOf("27.7", "27.8", "27.9", "27.10", "34.1.2"))

        // When
        val updatedFleetSegment =
            jpaFleetSegmentRepository.update(
                "ATL01",
                CreateOrUpdateFleetSegmentFields(faoAreas = listOf("67.6.6", "67.6.7")),
                currentYear,
            )

        // Then
        assertThat(updatedFleetSegment.segment).isEqualTo("ATL01")
        assertThat(updatedFleetSegment.faoAreas).isEqualTo(listOf("67.6.6", "67.6.7"))
    }

    @Test
    @Transactional
    fun `create Should insert a new fleet segment`() {
        // Given
        cacheManager.getCache("segments_by_year")?.clear()
        val fleetSegments = jpaFleetSegmentRepository.findAllByYear(currentYear)

        assertThat(fleetSegments).hasSize(67)

        // When
        jpaFleetSegmentRepository.save(
            FleetSegment(
                segment = "SEGMENT1",
                segmentName = "A NAME",
                gears = listOf(),
                faoAreas = listOf(),
                targetSpecies = listOf(),
                impactRiskFactor = 2.3,
                year = currentYear,
                mainScipSpeciesType = null,
                maxMesh = null,
                minMesh = null,
                minShareOfTargetSpecies = null,
                priority = 0.0,
                vesselTypes = listOf(),
            ),
        )

        // Then
        cacheManager.getCache("segments_by_year")?.clear()
        val updatedFleetSegments = jpaFleetSegmentRepository.findAllByYear(currentYear)
        assertThat(updatedFleetSegments).hasSize(68)
        val createdFleetSegment = updatedFleetSegments.find { it.segment == "SEGMENT1" }
        assertThat(createdFleetSegment?.segmentName).isEqualTo("A NAME")
    }

    @Test
    @Transactional
    fun `findAllByYear Should find all fleet segments of the given year`() {
        // When
        cacheManager.getCache("segments_by_year")?.clear()
        val fleetSegments = jpaFleetSegmentRepository.findAllByYear(currentYear - 1)

        // Then
        assertThat(fleetSegments).hasSize(43)
    }

    @Test
    @Transactional
    fun `delete Should delete a fleet segment`() {
        // Given
        cacheManager.getCache("segments_by_year")?.clear()
        val fleetSegments = jpaFleetSegmentRepository.findAllByYear(currentYear - 1)
        val segmentToDelete = fleetSegments.first()

        // When
        jpaFleetSegmentRepository.delete(segmentToDelete.segment, currentYear - 1)

        // Then
        cacheManager.getCache("segments_by_year")?.clear()
        val expectedFleetSegment = jpaFleetSegmentRepository.findAllByYear(currentYear - 1)
        assertThat(expectedFleetSegment).hasSize(42)
        assertThat(expectedFleetSegment).doesNotContain(segmentToDelete)
    }

    @Test
    @Transactional
    fun `findAllByYear Should return no fleet segments When there is no objectives for a given year`() {
        // When
        cacheManager.getCache("segments_by_year")?.clear()
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
        assertThat(yearEntries).hasSize(3)
        assertThat(yearEntries.first()).isEqualTo(currentYear)
        assertThat(yearEntries.last()).isEqualTo(2022)
    }

    @Test
    @Transactional
    fun `addYear Should add a new year copied from the specified year`() {
        // Given
        cacheManager.getCache("segments_by_year")?.clear()
        assertThat(jpaFleetSegmentRepository.findAllByYear(currentYear - 1)).hasSize(43)
        cacheManager.getCache("segments_by_year")?.clear()
        assertThat(jpaFleetSegmentRepository.findAllByYear(currentYear + 1)).hasSize(0)

        // When
        jpaFleetSegmentRepository.addYear(currentYear - 1, currentYear + 1)

        // Then
        cacheManager.getCache("segments_by_year")?.clear()
        assertThat(jpaFleetSegmentRepository.findAllByYear(currentYear - 1)).hasSize(43)
        cacheManager.getCache("segments_by_year")?.clear()
        val updatedFleetSegments = jpaFleetSegmentRepository.findAllByYear(currentYear + 1).sortedBy { it.segment }
        assertThat(updatedFleetSegments).hasSize(43)
    }

    @Test
    @Transactional
    fun `findAllSegmentsGearsWithRequiredMesh Should return all gears having a min or max mesh`() {
        // When
        cacheManager.getCache("segments_with_gears_mesh_condition")?.clear()
        val gears = jpaFleetSegmentRepository.findAllSegmentsGearsWithRequiredMesh(currentYear)

        assertThat(gears).hasSize(26)
        assertThat(gears).isEqualTo(
            listOf(
                "PTM", "GTN", "PTB", "GNF", "TBB", "TBS", "OTT", "TB", "SDN", "TM", "SSC", "OTM", "GTR", "GNC", "SX",
                "TBN", "PT", "GN", "SV", "TX", "GEN", "SPR", "GNS", "OT", "TMS", "OTB",
            ),
        )
    }
}
