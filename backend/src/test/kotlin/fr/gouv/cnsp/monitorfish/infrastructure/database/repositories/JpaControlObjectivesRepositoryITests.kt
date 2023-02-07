package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.control_objective.ControlObjective
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.format.DateTimeFormatter

class JpaControlObjectivesRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaControlObjectivesRepository: JpaControlObjectivesRepository

    private val currentYear: Int
    private val lastYear: Int
    private val nextYear: Int

    init {
        val formatter = DateTimeFormatter.ofPattern("yyyy")
        currentYear = LocalDate.now().format(formatter).toInt()
        lastYear = currentYear - 1
        nextYear = currentYear + 1
    }

    @Test
    @Transactional
    fun `findAllByYear Should find all control objectives of the given year`() {
        // When
        val controlObjectives = jpaControlObjectivesRepository.findAllByYear(lastYear)

        // Then
        assertThat(controlObjectives).hasSize(53)
    }

    @Test
    @Transactional
    fun `findAllByYear Should return no control objectives When there is no objectives for a given year`() {
        // When
        val controlObjectives = jpaControlObjectivesRepository.findAllByYear(currentYear - 2)

        // Then
        assertThat(controlObjectives).hasSize(0)
    }

    @Test
    @Transactional
    fun `findYearEntries Should return year entries`() {
        // When
        val yearEntries = jpaControlObjectivesRepository.findYearEntries()

        // Then
        assertThat(yearEntries).hasSize(2)
        assertThat(yearEntries.first()).isEqualTo(currentYear)
        assertThat(yearEntries.last()).isEqualTo(lastYear)
    }

    @Test
    @Transactional
    fun `update Should update targetNumberOfControlsAtPort When not null`() {
        // Given
        val controlObjectives = jpaControlObjectivesRepository.findAllByYear(lastYear)

        // When
        assertThat(controlObjectives.find { it.id == 9 }?.targetNumberOfControlsAtPort).isEqualTo(50)
        jpaControlObjectivesRepository.update(
            id = 9,
            targetNumberOfControlsAtPort = 153,
            targetNumberOfControlsAtSea = null,
            controlPriorityLevel = null,
        )

        // Then
        val updatedControlObjective = jpaControlObjectivesRepository.findAllByYear(lastYear).find { it.id == 9 }
        assertThat(updatedControlObjective?.targetNumberOfControlsAtPort).isEqualTo(153)
    }

    @Test
    @Transactional
    fun `update Should update targetNumberOfControlsAtSea When not null`() {
        // Given
        val controlObjectives = jpaControlObjectivesRepository.findAllByYear(lastYear)

        // When
        assertThat(controlObjectives.find { it.id == 9 }?.targetNumberOfControlsAtSea).isEqualTo(20)
        jpaControlObjectivesRepository.update(
            id = 9,
            targetNumberOfControlsAtPort = null,
            targetNumberOfControlsAtSea = 10,
            controlPriorityLevel = null,
        )

        // Then
        val updatedControlObjective = jpaControlObjectivesRepository.findAllByYear(lastYear).find { it.id == 9 }
        assertThat(updatedControlObjective?.targetNumberOfControlsAtSea).isEqualTo(10)
    }

    @Test
    @Transactional
    fun `update Should update controlPriorityLevel When not null`() {
        // Given
        val controlObjectives = jpaControlObjectivesRepository.findAllByYear(lastYear)

        // When
        assertThat(controlObjectives.find { it.id == 9 }?.controlPriorityLevel).isEqualTo(1.0)
        jpaControlObjectivesRepository.update(
            id = 9,
            targetNumberOfControlsAtPort = null,
            targetNumberOfControlsAtSea = null,
            controlPriorityLevel = 2.0,
        )

        // Then
        val updatedControlObjective = jpaControlObjectivesRepository.findAllByYear(lastYear).find { it.id == 9 }
        assertThat(updatedControlObjective?.controlPriorityLevel).isEqualTo(2.0)
    }

    @Test
    @Transactional
    fun `add Should add a new control objective to a facade`() {
        // Given
        val controlObjectives = jpaControlObjectivesRepository.findAllByYear(lastYear)
        assertThat(controlObjectives).hasSize(53)

        // When
        jpaControlObjectivesRepository.add(
            ControlObjective(
                segment = "SEGMENT",
                facade = "FACADE",
                year = lastYear,
                targetNumberOfControlsAtSea = 25,
                targetNumberOfControlsAtPort = 64,
                controlPriorityLevel = 2.0,
            ),
        )

        // Then
        val updatedControlObjectives = jpaControlObjectivesRepository.findAllByYear(lastYear)
        assertThat(updatedControlObjectives).hasSize(54)
        assertThat(updatedControlObjectives.find { it.segment == "SEGMENT" }?.targetNumberOfControlsAtSea).isEqualTo(25)
    }

    @Test
    @Transactional
    fun `addYear Should add a new year copied from the specified year`() {
        // Given
        assertThat(jpaControlObjectivesRepository.findAllByYear(lastYear)).hasSize(53)
        assertThat(jpaControlObjectivesRepository.findAllByYear(nextYear)).hasSize(0)

        // When
        jpaControlObjectivesRepository.addYear(lastYear, nextYear)

        // Then
        assertThat(jpaControlObjectivesRepository.findAllByYear(lastYear)).hasSize(53)
        val updatedControlObjectives = jpaControlObjectivesRepository.findAllByYear(nextYear)
        assertThat(updatedControlObjectives).hasSize(53)
        assertThat(updatedControlObjectives.first().id).isEqualTo(107)
        assertThat(updatedControlObjectives.first().year).isEqualTo(nextYear)
    }
}
