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
    val searchVessels = "search_vessels"
    val gears = "gears"
    val gear = "gear"
    val ports = "ports"
    val port = "port"
    val allSpecies = "all_species"
    val species = "species"
    val ers = "ers_messages"
    val nextErs = "next_ers"
    val previousErs = "previous_ers"
    val ersRawMessage = "ers_raw_message"
    val vesselTrack = "vessel_track"
    val vesselsPosition = "vessels_position"
    val infractions = "infractions"
    val fleetSegments = "fleet_segments"
    val currentSegments = "current_segment"
    val controlAnteriority = "control_anteriority"
    val riskFactors = "risk_factors"

    @Bean
    fun cacheManager(ticker: Ticker): CacheManager? {
        val oneWeek = 10080

        val ersCache = buildCache(ers, ticker, 10)
        val nextErsCache = buildCache(nextErs, ticker, 10)
        val previousErsCache = buildCache(previousErs, ticker, 10)
        val ersRawMessageCache = buildCache(ersRawMessage, ticker, oneWeek)
        val vesselCache = buildCache(vessels, ticker, 180)

        val gearsCache = buildCache(gears, ticker, oneWeek)
        val gearCache = buildCache(gear, ticker, oneWeek)

        val allSpeciesCache = buildCache(allSpecies, ticker, oneWeek)
        val speciesCache = buildCache(species, ticker, oneWeek)

        val portsCache = buildCache(ports, ticker, oneWeek)
        val portCache = buildCache(port, ticker, oneWeek)
        val fleetSegmentsCache = buildCache(fleetSegments, ticker, oneWeek)
        val currentSegmentsCache = buildCache(currentSegments, ticker, 1)
        val controlAnteriorityCache = buildCache(controlAnteriority, ticker, 1)
        val riskFactorsCache = buildCache(riskFactors, ticker, 1)

        val infractionsCache = buildCache(infractions, ticker, oneWeek)

        val vesselTrackCache = buildCache(vesselTrack, ticker, 1)
        val vesselsPositionCache = buildCache(vesselsPosition, ticker, 1)
        val searchVesselsCache = buildCache(searchVessels, ticker, 180)

        val manager = SimpleCacheManager()
        manager.setCaches(listOf(
                vesselCache,
                vesselTrackCache,
                vesselsPositionCache,
                gearsCache,
                gearCache,
                portsCache,
                portCache,
                allSpeciesCache,
                speciesCache,
                searchVesselsCache,
                ersCache,
                nextErsCache,
                previousErsCache,
                ersRawMessageCache,
                infractionsCache,
                fleetSegmentsCache,
                currentSegmentsCache,
                controlAnteriorityCache,
                riskFactorsCache))

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