package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.neovisionaries.i18n.CountryCode
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

class JpaLastPositionAisRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaLastPositionAisRepository: JpaLastPositionAisRepository

    @Test
    @Transactional
    fun `findAll Should return all AIS last positions`() {
        // When
        val positions = jpaLastPositionAisRepository.findAll()

        // Then
        assertThat(positions).hasSize(10000)
    }

    @Test
    @Transactional
    fun `findAll Should return positions with required fields mapped`() {
        // When
        val positions = jpaLastPositionAisRepository.findAll()

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
        val positions = jpaLastPositionAisRepository.findAll()

        // Then — test data uses NOW() - N minutes (N <= 240) so all datetimes should be recent
        val fourHoursAgo = ZonedDateTime.now().minusHours(4).minusMinutes(10)
        assertThat(positions).allSatisfy { position ->
            assertThat(position.dateTime).isAfter(fourHoursAgo)
        }
    }

    @Test
    @Transactional
    fun `findAll Should correctly parse flagState as CountryCode`() {
        // When
        val positions = jpaLastPositionAisRepository.findAll()

        // Then — none of the generated flag states should fall back to UNDEFINED
        assertThat(positions).allSatisfy { position ->
            assertThat(position.flagState).isNotEqualTo(CountryCode.UNDEFINED)
        }
    }

    @Test
    @Transactional
    fun `findByIsAtPort Should return only vessels at port when isAtPort is true`() {
        // When
        val positions = jpaLastPositionAisRepository.findByIsAtPort(true)

        // Then
        assertThat(positions).isNotEmpty()
        assertThat(positions).allSatisfy { assertThat(it.isAtPort).isTrue() }
    }

    @Test
    @Transactional
    fun `findByIsAtPort Should return only vessels at sea when isAtPort is false`() {
        // When
        val positions = jpaLastPositionAisRepository.findByIsAtPort(false)

        // Then
        assertThat(positions).isNotEmpty()
        assertThat(positions).allSatisfy { assertThat(it.isAtPort).isFalse() }
    }
}
