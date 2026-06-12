package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBLastPositionAisRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

class JpaLastPositionAisRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaLastPositionAisRepository: JpaLastPositionAisRepository

    @Autowired
    private lateinit var dbLastPositionAisRepository: DBLastPositionAisRepository

    @Test
    @Transactional
    fun `findAll Should return only AIS positions that have no CFR`() {
        // Given
        val totalCount = dbLastPositionAisRepository.count()

        // When
        val positions = jpaLastPositionAisRepository.findAllByCfrIsNull()

        // Then — findAll filters to non-CFR vessels (~2% of 10 000 test rows)
        assertThat(positions).isNotEmpty()
        assertThat(positions.size.toLong()).isLessThan(totalCount)
    }

    @Test
    @Transactional
    fun `findAll Should return positions with required fields mapped`() {
        // When
        val positions = jpaLastPositionAisRepository.findAllByCfrIsNull()

        // Then
        assertThat(positions).allSatisfy { position ->
            assertThat(position.mmsi).isPositive()
            assertThat(position.latitude).isBetween(-90.0, 90.0)
            assertThat(position.longitude).isBetween(-180.0, 180.0)
            assertThat(position.dateTime).isNotNull()
        }
    }

    @Test
    @Transactional
    fun `findAll Should return positions with recent datetime`() {
        // When
        val positions = jpaLastPositionAisRepository.findAllByCfrIsNull()

        // Then — test data uses NOW() - N minutes (N <= 240) so all datetimes should be recent
        val fourHoursAgo = ZonedDateTime.now().minusHours(4).minusMinutes(10)
        assertThat(positions).allSatisfy { position ->
            assertThat(position.dateTime).isAfter(fourHoursAgo)
        }
    }

    @Test
    @Transactional
    fun `findByIsAtPort Should return only non-CFR vessels at port when isAtPort is true`() {
        // Given
        val allAtPort = dbLastPositionAisRepository.findByIsAtPort(true)

        // When
        val positions = jpaLastPositionAisRepository.findAllByCfrIsNullAndIsAtPort(true)

        // Then
        assertThat(positions).isNotEmpty()
        assertThat(positions).allSatisfy { assertThat(it.isAtPort).isTrue() }
        assertThat(positions.size).isLessThanOrEqualTo(allAtPort.size)
    }

    @Test
    @Transactional
    fun `findByIsAtPort Should return only non-CFR vessels at sea when isAtPort is false`() {
        // Given
        val allAtSea = dbLastPositionAisRepository.findByIsAtPort(false)

        // When
        val positions = jpaLastPositionAisRepository.findAllByCfrIsNullAndIsAtPort(false)

        // Then
        assertThat(positions).isNotEmpty()
        assertThat(positions).allSatisfy { assertThat(it.isAtPort).isFalse() }
        assertThat(positions.size).isLessThanOrEqualTo(allAtSea.size)
    }
}
