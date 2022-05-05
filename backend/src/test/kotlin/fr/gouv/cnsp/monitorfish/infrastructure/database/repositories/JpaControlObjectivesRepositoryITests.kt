package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.annotation.Transactional

@RunWith(SpringRunner::class)
class JpaControlObjectivesRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaControlObjectivesRepository: JpaControlObjectivesRepository

    @Test
    @Transactional
    fun `findAllByYear Should find all control objectives of the given year`() {
        // When
        val controlObjectives = jpaControlObjectivesRepository.findAllByYear(2021)

        // Then
        assertThat(controlObjectives).hasSize(53)
    }

    @Test
    @Transactional
    fun `findAllByYear Should return no control objectives When there is no objectives for a given year`() {
        // When
        val controlObjectives = jpaControlObjectivesRepository.findAllByYear(2020)

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
        assertThat(yearEntries.first()).isEqualTo(2022)
        assertThat(yearEntries.last()).isEqualTo(2021)
    }

    @Test
    @Transactional
    fun `update Should update targetNumberOfControlsAtPort When not null`() {
        // Given
        val controlObjectives = jpaControlObjectivesRepository.findAllByYear(2021)

        // When
        assertThat(controlObjectives.find { it.id == 9 }?.targetNumberOfControlsAtPort).isEqualTo(50)
        jpaControlObjectivesRepository.update(
                id = 9,
                targetNumberOfControlsAtPort = 153,
                targetNumberOfControlsAtSea = null,
                controlPriorityLevel = null)

        // Then
        val updatedControlObjective = jpaControlObjectivesRepository.findAllByYear(2021).find { it.id == 9 }
        assertThat(updatedControlObjective?.targetNumberOfControlsAtPort).isEqualTo(153)
    }

    @Test
    @Transactional
    fun `update Should update targetNumberOfControlsAtSea When not null`() {
        // Given
        val controlObjectives = jpaControlObjectivesRepository.findAllByYear(2021)

        // When
        assertThat(controlObjectives.find { it.id == 9 }?.targetNumberOfControlsAtSea).isEqualTo(20)
        jpaControlObjectivesRepository.update(
                id = 9,
                targetNumberOfControlsAtPort = null,
                targetNumberOfControlsAtSea = 10,
                controlPriorityLevel = null)

        // Then
        val updatedControlObjective = jpaControlObjectivesRepository.findAllByYear(2021).find { it.id == 9 }
        assertThat(updatedControlObjective?.targetNumberOfControlsAtSea).isEqualTo(10)
    }

    @Test
    @Transactional
    fun `update Should update controlPriorityLevel When not null`() {
        // Given
        val controlObjectives = jpaControlObjectivesRepository.findAllByYear(2021)

        // When
        assertThat(controlObjectives.find { it.id == 9 }?.controlPriorityLevel).isEqualTo(1.0)
        jpaControlObjectivesRepository.update(
                id = 9,
                targetNumberOfControlsAtPort = null,
                targetNumberOfControlsAtSea = null,
                controlPriorityLevel = 2.0)

        // Then
        val updatedControlObjective = jpaControlObjectivesRepository.findAllByYear(2021).find { it.id == 9 }
        assertThat(updatedControlObjective?.controlPriorityLevel).isEqualTo(2.0)
    }
}
