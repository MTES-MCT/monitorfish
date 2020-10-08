package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.entities.PositionType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZonedDateTime

@RunWith(SpringRunner::class)
class JpaPositionsRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaPositionRepository: JpaPositionsRepository

    @Test
    @Transactional
    fun `findAll Should return the list of positions`() {
        // When
        val positions = jpaPositionRepository.findAll()

        // Then
        assertThat(positions).isNotEmpty
        assertThat(positions).hasSize(1441)
    }

    @Test
    @Transactional
    fun `save Should save the position date and keep the given zone`() {
        // Given
        val farPastFixedDateTime = ZonedDateTime.of(LocalDate.EPOCH, LocalTime.MAX.plusSeconds(1), ZoneId.of("UTC"));
        val expectedPosition = Position(0, "REF_NUMBER", null, null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, farPastFixedDateTime)

        // When
        jpaPositionRepository.save(expectedPosition)

        // Then
        val position = jpaPositionRepository.findAll().last()
        assertThat(position.dateTime.toString()).isEqualTo("1970-01-01T00:00:00.999999999Z[UTC]")
    }
}