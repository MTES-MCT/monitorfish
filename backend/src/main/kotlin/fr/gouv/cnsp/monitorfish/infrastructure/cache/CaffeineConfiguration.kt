package fr.gouv.cnsp.monitorfish.infrastructure.cache

import com.github.benmanes.caffeine.cache.Caffeine
import com.github.benmanes.caffeine.cache.Ticker
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.EnableCaching
import org.springframework.cache.caffeine.CaffeineCache
import org.springframework.cache.support.SimpleCacheManager
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.util.concurrent.TimeUnit


@EnableCaching
@Configuration
class CaffeineConfiguration {
    val vessels = "vessel"
    val gear = "gear"
    val vesselTrack = "vessel_track"
    val vesselsPosition = "vessels_position"

    @Bean
    fun cacheManager(ticker: Ticker): CacheManager? {
        val vesselCache = buildCache(vessels, ticker, 5)
        val gearCache = buildCache(gear, ticker, 60)
        val vesselTrackCache = buildCache(vesselTrack, ticker, 1)
        val vesselsPositions = buildCache(vesselsPosition, ticker, 1)
        val manager = SimpleCacheManager()
        manager.setCaches(listOf(vesselCache, vesselTrackCache, vesselsPositions, gearCache))

        return manager
    }

    private fun buildCache(name: String, ticker: Ticker, minutesToExpire: Int): CaffeineCache {
        return CaffeineCache(name, Caffeine.newBuilder()
                .expireAfterWrite(minutesToExpire.toLong(), TimeUnit.MINUTES)
                .recordStats()
                .ticker(ticker)
                .build())
    }

    @Bean
    fun ticker(): Ticker? {
        return Ticker.systemTicker()
    }
}