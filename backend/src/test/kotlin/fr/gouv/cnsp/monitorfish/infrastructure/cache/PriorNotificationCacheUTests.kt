package fr.gouv.cnsp.monitorfish.infrastructure.cache

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.infrastructure.cache.CacheName
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LogbookReportEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.JpaLogbookReportRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBLogbookReportRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.cache.caffeine.CaffeineCache
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicInteger

/**
 * Guards the fix for the connection pool saturation of https://github.com/MTES-MCT/monitorfish/issues/4561:
 * without `sync = true`, every concurrent cache miss ran its own copy of the (very slow) PNO stored
 * procedure, holding one connection each until the pool was exhausted.
 */
@ExtendWith(SpringExtension::class)
@ContextConfiguration(classes = [CaffeineConfiguration::class, JpaLogbookReportRepository::class])
class PriorNotificationCacheUTests {
    @MockitoBean
    private lateinit var objectMapper: ObjectMapper

    @MockitoBean
    private lateinit var dbLogbookReportRepository: DBLogbookReportRepository

    // The interface, not the concrete class: `@Cacheable` wraps the bean in a JDK proxy.
    @Autowired
    private lateinit var logbookReportRepository: LogbookReportRepository

    @Autowired
    private lateinit var cacheManager: CacheManager

    @BeforeEach
    fun setup() {
        cacheManager.getCache(CacheName.PNO_TO_VERIFY)?.clear()
        cacheManager.getCache(CacheName.PNO_FOR_ACTIVE_VESSELS)?.clear()
    }

    @Test
    fun `findAllPriorNotificationsToVerify Should only query the database once for concurrent calls`() {
        assertSingleQueryFor { logbookReportRepository.findAllPriorNotificationsToVerify() }
    }

    @Test
    fun `findAllAcknowledgedPriorNotificationsForActiveVessels Should only query the database once for concurrent calls`() {
        assertSingleQueryFor { logbookReportRepository.findAllAcknowledgedPriorNotificationsForActiveVessels() }
    }

    @Test
    fun `The prior notifications to verify caches Should not outlive one minute`() {
        // The side window PNO list is served uncached, so a longer TTL here makes the map badge
        // under-report what the list shows — the bug reported in #5285.
        listOf("pno_to_verify", "manual_pno_to_verify").forEach { cacheName ->
            val cache =
                requireNotNull(cacheManager.getCache(cacheName) as? CaffeineCache) {
                    "Cache $cacheName is missing"
                }

            val expiration = cache.nativeCache.policy().expireAfterWrite()
            assertThat(expiration).isPresent()
            assertThat(expiration.get().getExpiresAfter(TimeUnit.MINUTES)).isLessThanOrEqualTo(1)
        }
    }

    private fun assertSingleQueryFor(findAll: () -> Unit) {
        // Given
        val concurrentCalls = 8
        val queryCount = AtomicInteger(0)
        given(
            dbLogbookReportRepository.findAllEnrichedPnoReferencesAndRelatedOperations(
                flagStates = anyOrNull(),
                hasOneOrMoreReportings = anyOrNull(),
                isLessThanTwelveMetersVessel = anyOrNull(),
                lastControlledAfter = anyOrNull(),
                lastControlledBefore = anyOrNull(),
                portLocodes = anyOrNull(),
                priorNotificationTypesAsSqlArrayString = anyOrNull(),
                searchQuery = anyOrNull(),
                specyCodesAsSqlArrayString = anyOrNull(),
                tripGearCodesAsSqlArrayString = anyOrNull(),
                tripSegmentCodesAsSqlArrayString = anyOrNull(),
                willArriveAfter = any(),
                willArriveBefore = any(),
            ),
        ).willAnswer {
            queryCount.incrementAndGet()
            // Stands in for the slow stored procedure, so that all the callers overlap on the miss.
            Thread.sleep(300)

            emptyList<LogbookReportEntity>()
        }

        // When
        val startLine = CountDownLatch(1)
        val finishLine = CountDownLatch(concurrentCalls)
        val executor = Executors.newFixedThreadPool(concurrentCalls)
        val errors = ConcurrentLinkedQueue<Throwable>()
        repeat(concurrentCalls) {
            executor.submit {
                try {
                    startLine.await()
                    findAll()
                } catch (e: Throwable) {
                    errors.add(e)
                }
                finishLine.countDown()
            }
        }
        startLine.countDown()
        val haveAllFinished = finishLine.await(30, TimeUnit.SECONDS)
        executor.shutdownNow()

        // Then
        assertThat(errors).isEmpty()
        assertThat(haveAllFinished).isTrue()
        assertThat(queryCount.get()).isEqualTo(1)
    }
}
