package fr.gouv.cnsp.monitorfish.infrastructure.cache

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.JpaPositionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPositionRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime
import java.util.concurrent.atomic.AtomicInteger

/**
 * The track window is derived from `ZonedDateTime.now()` by the callers, so without truncation every
 * call produces a brand new key: the cache never hits, and only ever accumulates entries.
 */
@ExtendWith(SpringExtension::class)
@ContextConfiguration(classes = [CaffeineConfiguration::class, JpaPositionRepository::class])
class VesselTrackCacheUTests {
    @MockitoBean
    private lateinit var dbPositionRepository: DBPositionRepository

    @Autowired
    private lateinit var positionRepository: PositionRepository

    @Autowired
    private lateinit var cacheManager: CacheManager

    @BeforeEach
    fun setup() {
        cacheManager.getCache(CacheName.VESSEL_TRACK)?.clear()
    }

    @Test
    fun `Two track requests within the same minute Should only query the database once`() {
        // Given
        val queryCount = AtomicInteger(0)
        given(dbPositionRepository.findLastByInternalReferenceNumber(any(), any(), any()))
            .willAnswer {
                queryCount.incrementAndGet()

                emptyList<Nothing>()
            }

        // Two windows a few hundred milliseconds apart, as two consecutive polls would produce.
        // Fixed instants rather than `now()`, so the test cannot straddle a minute boundary.
        val firstFrom = ZonedDateTime.parse("2026-09-15T08:00:00.123Z")
        val firstTo = ZonedDateTime.parse("2026-09-15T20:00:00.123Z")
        val secondFrom = ZonedDateTime.parse("2026-09-15T08:00:00.456Z")
        val secondTo = ZonedDateTime.parse("2026-09-15T20:00:00.789Z")

        // When
        positionRepository.findVesselLastPositionsByInternalReferenceNumber("CFR123", firstFrom, firstTo)
        positionRepository.findVesselLastPositionsByInternalReferenceNumber("CFR123", secondFrom, secondTo)

        // Then
        assertThat(queryCount.get()).isEqualTo(1)
    }

    @Test
    fun `Two track requests in different minutes Should each query the database`() {
        // Given
        val queryCount = AtomicInteger(0)
        given(dbPositionRepository.findLastByInternalReferenceNumber(any(), any(), any()))
            .willAnswer {
                queryCount.incrementAndGet()

                emptyList<Nothing>()
            }

        val from = ZonedDateTime.parse("2026-09-15T08:00:00Z")

        // When
        positionRepository.findVesselLastPositionsByInternalReferenceNumber(
            "CFR123",
            from,
            ZonedDateTime.parse("2026-09-15T20:00:00Z"),
        )
        positionRepository.findVesselLastPositionsByInternalReferenceNumber(
            "CFR123",
            from,
            ZonedDateTime.parse("2026-09-15T20:01:00Z"),
        )

        // Then
        assertThat(queryCount.get()).isEqualTo(2)
    }

    @Test
    fun `Two different vessels Should each query the database`() {
        // Given
        val queryCount = AtomicInteger(0)
        given(dbPositionRepository.findLastByInternalReferenceNumber(any(), any(), any()))
            .willAnswer {
                queryCount.incrementAndGet()

                emptyList<Nothing>()
            }

        val from = ZonedDateTime.parse("2026-09-15T08:00:00Z")
        val to = ZonedDateTime.parse("2026-09-15T20:00:00Z")

        // When
        positionRepository.findVesselLastPositionsByInternalReferenceNumber("CFR123", from, to)
        positionRepository.findVesselLastPositionsByInternalReferenceNumber("CFR456", from, to)

        // Then
        assertThat(queryCount.get()).isEqualTo(2)
    }
}
