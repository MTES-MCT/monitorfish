package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.entities.PositionType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

@RunWith(SpringRunner::class)
class JpaLastPositionRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaLastPositionRepository: JpaLastPositionRepository

    @Autowired
    lateinit var cacheManager: CacheManager

    @BeforeEach
    fun setup() {
        cacheManager.getCache("vessels_position")?.clear()
    }

    @Test
    @Transactional
    fun `upsert Should add a new position When the vessel does not exist in the table and the CFR is empty`() {
        // Given
        val now = ZonedDateTime.now()
        val positionWithoutInternalReferenceNumber = Position(null, "", "Patrouilleur", null, "PM45", null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now)

        // When
        jpaLastPositionRepository.upsert(positionWithoutInternalReferenceNumber)
        val lastPositions = jpaLastPositionRepository.findAll()

        // Then
        // Size of test data is 2886
        // + 1 position of a vessel without an internal reference number (1 entry)
        // the expected last positions size is 2885
        assertThat(lastPositions).hasSize(2887)
    }

    @Test
    @Transactional
    fun `upsert Should add a new position When the vessel does not exist in the table and the CFR is null`() {
        // Given
        val now = ZonedDateTime.now()
        val positionWithoutInternalReferenceNumber = Position(null, null, "TEST", null, "YEAH", null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now)

        // When
        jpaLastPositionRepository.upsert(positionWithoutInternalReferenceNumber)
        val lastPositions = jpaLastPositionRepository.findAll()

        val position = lastPositions.find { it.MMSI == "TEST" }
        assertThat(position).isNotNull
        // Then
        // Size of test data is 2886
        // + 1 position of a vessel without an internal reference number (1 entry)
        // the expected last positions size is 2887
        assertThat(lastPositions).hasSize(2887)
    }

    @Test
    @Transactional
    fun `upsert Should update a given position When the vessel is already saved`() {
        // Given
        val now = ZonedDateTime.now()
        val onePosition = Position(null, "FR224226850", "224226850", null, "", null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now)

        // When
        jpaLastPositionRepository.upsert(onePosition)
        val lastPositions = jpaLastPositionRepository.findAll()

        // Then
        // Size of test data is 2886
        // + 1 position of the vessel FR224226850
        // the expected last positions size is 2887
        assertThat(lastPositions).hasSize(2887)
        val position = lastPositions.single {
            it.internalReferenceNumber == "FR224226850"
        }
        assertThat(position.dateTime).isEqualTo(now)
    }
}
