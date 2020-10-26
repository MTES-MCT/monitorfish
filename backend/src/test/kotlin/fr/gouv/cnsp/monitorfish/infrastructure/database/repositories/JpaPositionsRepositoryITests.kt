package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.entities.PositionType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
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
    fun `findAll Should return the list of distinct ships last positions`() {
        // Given
        val now = ZonedDateTime.now()
        val onePosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now)

        // When
        jpaPositionRepository.save(onePosition)
        val lastPositions = jpaPositionRepository.findLastDistinctPositions()

        // Then
        // Size of test data is 1441 + 1 position, as the ship FR224226850 has 2 entries
        // the expected last positions size is 1441
        assertThat(lastPositions).hasSize(1441)
        val lastInsertedPosition = lastPositions.filter { it.internalReferenceNumber == "FR224226850" }
        assertThat(lastInsertedPosition).hasSize(1)
        assertThat(lastInsertedPosition.first().dateTime).isEqualTo(now)
    }

    @Test
    @Transactional
    fun `save Should save the position`() {
        // Given
        val farPastFixedDateTime = ZonedDateTime.of(LocalDate.EPOCH, LocalTime.MAX.plusSeconds(1), ZoneId.of("UTC"));
        val expectedPosition = Position(null, "REF_NUMBER", "224136470", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, farPastFixedDateTime)

        // When
        jpaPositionRepository.save(expectedPosition)

        // Then
        val positions = jpaPositionRepository.findAll()

        val sameMMSIPositions = positions.filter {
            it.MMSI == "224136470"
        }
        assertThat(sameMMSIPositions).hasSize(2)
        assertThat(positions).hasSize(1442)
        assertThat(positions.last().dateTime.toString()).isEqualTo("1970-01-01T00:00:00.999999999Z[UTC]")
    }

    @Test
    @Transactional
    fun `findShipLastPositions Should return the list of last positions for a given ship`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        val firstPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(4))
        val secondPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(3))
        val thirdPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(2))
        val fourthPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(1))

        // When
        jpaPositionRepository.save(firstPosition)
        jpaPositionRepository.save(secondPosition)
        jpaPositionRepository.save(thirdPosition)
        jpaPositionRepository.save(fourthPosition)
        val lastPositions = jpaPositionRepository.findShipLastPositions("FR224226850")

        // Then
        // For this ship, we inserted 4 rows and then were 1 row inserted with the DB test data
        assertThat(lastPositions).hasSize(5)
    }
}