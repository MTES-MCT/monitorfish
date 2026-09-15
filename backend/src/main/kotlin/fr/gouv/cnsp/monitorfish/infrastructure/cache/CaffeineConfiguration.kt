package fr.gouv.cnsp.monitorfish.infrastructure.cache

import com.github.benmanes.caffeine.cache.Caffeine
import com.github.benmanes.caffeine.cache.Ticker
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.EnableCaching
import org.springframework.cache.caffeine.CaffeineCache
import org.springframework.cache.support.SimpleCacheManager
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import kotlin.time.toJavaDuration

@EnableCaching
@Configuration
class CaffeineConfiguration {
    @Bean
    fun cacheManager(ticker: Ticker): CacheManager =
        SimpleCacheManager().apply {
            setCaches(MonitorfishCache.entries.map { build(it, ticker) })
        }

    private fun build(
        cache: MonitorfishCache,
        ticker: Ticker,
    ): CaffeineCache =
        CaffeineCache(
            cache.cacheName,
            Caffeine
                .newBuilder()
                .maximumSize(cache.maximumSize)
                .also { builder ->
                    cache.expiresAfterWrite?.let { builder.expireAfterWrite(it.toJavaDuration()) }
                }.recordStats()
                .ticker(ticker)
                .build(),
        )

    @Bean
    fun ticker(): Ticker = Ticker.systemTicker()
}
