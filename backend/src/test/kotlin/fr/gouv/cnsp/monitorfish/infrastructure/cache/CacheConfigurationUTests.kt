package fr.gouv.cnsp.monitorfish.infrastructure.cache

import com.github.benmanes.caffeine.cache.Ticker
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.CachePut
import org.springframework.cache.annotation.Cacheable
import org.springframework.cache.caffeine.CaffeineCache
import org.springframework.cache.support.SimpleCacheManager
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider
import org.springframework.core.type.filter.RegexPatternTypeFilter
import java.lang.reflect.Method
import java.util.regex.Pattern

/**
 * Invariants of the cache registry. A cache name lives both in a `@Cacheable` / `@CacheEvict`
 * annotation and in [MonitorfishCache], and nothing links the two at compile time: a name present in
 * only one of them fails at runtime on the first call, or silently wastes memory.
 */
class CacheConfigurationUTests {
    private val cacheManager =
        requireNotNull(CaffeineConfiguration().cacheManager(Ticker.systemTicker()))
            // `SimpleCacheManager` only populates its cache map in `afterPropertiesSet`, which
            // Spring calls for us at runtime but not here.
            .also { (it as SimpleCacheManager).afterPropertiesSet() }

    private val registeredCacheNames = cacheManager.cacheNames

    /** Cache name -> every annotated method reading or evicting it. */
    private val annotatedMethodsByCacheName: Map<String, List<Method>> =
        ClassPathScanningCandidateComponentProvider(false)
            .apply { addIncludeFilter(RegexPatternTypeFilter(Pattern.compile(".*"))) }
            .findCandidateComponents("fr.gouv.cnsp.monitorfish")
            .mapNotNull { it.beanClassName }
            .flatMap { Class.forName(it).methods.asList() }
            .flatMap { method -> cacheNamesOf(method).map { it to method } }
            .groupBy({ it.first }, { it.second })

    private fun cacheNamesOf(method: Method): List<String> =
        listOfNotNull(
            method.getAnnotation(Cacheable::class.java)?.value,
            method.getAnnotation(CacheEvict::class.java)?.value,
            method.getAnnotation(CachePut::class.java)?.value,
        ).flatMap { it.asList() }

    @Test
    fun `Every annotated cache name Should be registered in the cache manager`() {
        assertThat(annotatedMethodsByCacheName.keys).isNotEmpty()
        assertThat(registeredCacheNames).containsAll(annotatedMethodsByCacheName.keys)
    }

    @Test
    fun `Every registered cache Should be used by at least one annotation`() {
        assertThat(registeredCacheNames - annotatedMethodsByCacheName.keys).isEmpty()
    }

    @Test
    fun `Every cache Should be bounded by a maximum size`() {
        // An unbounded cache keyed on user input (a search string, a list of ids, a date range)
        // grows until the JVM runs out of heap instead of evicting.
        val unboundedCacheNames =
            registeredCacheNames.filter { name ->
                (cacheManager.getCache(name) as CaffeineCache)
                    .nativeCache
                    .policy()
                    .eviction()
                    .isEmpty
            }

        assertThat(unboundedCacheNames).isEmpty()
    }

    @Test
    fun `A cache holding a single entry Should be read with sync`() {
        // Every caller of a single-entry cache shares the one key, so a miss is always a full
        // thundering herd: without `sync` they all run the query at once. See #4561.
        val unsynchronisedCacheNames =
            MonitorfishCache.entries
                .filter { it.maximumSize == 1L }
                .filter { cache ->
                    annotatedMethodsByCacheName[cache.cacheName]
                        ?.mapNotNull { it.getAnnotation(Cacheable::class.java) }
                        ?.any { !it.sync } ?: false
                }.map { it.cacheName }

        assertThat(unsynchronisedCacheNames).isEmpty()
    }

    @Test
    fun `A cache holding a single entry Should only be read by methods taking no argument`() {
        // `SINGLE_ENTRY` is only correct while the key stays `SimpleKey.EMPTY`. Adding an argument to
        // such a method turns its cache into a one-slot cache that thrashes on every call.
        val thrashingCacheNames =
            MonitorfishCache.entries
                .filter { it.maximumSize == 1L }
                .filter { cache ->
                    annotatedMethodsByCacheName[cache.cacheName]
                        ?.any { it.getAnnotation(Cacheable::class.java) != null && it.parameterCount > 0 }
                        ?: false
                }.map { it.cacheName }

        assertThat(thrashingCacheNames).isEmpty()
    }
}
