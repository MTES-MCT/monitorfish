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
    val searchBeacons = "search_beacons"
    val gearCodeGroups = "gear_code_groups"
    val gearCodeGroup = "gear_code_group"
    val gears = "gears"
    val gear = "gear"
    val ports = "ports"
    val activePorts = "active_ports"
    val port = "port"
    val allSpecies = "all_species"
    val allSpeciesGroups = "all_species_groups"
    val species = "species"
    val logbook = "logbook_messages"
    val nextLogbook = "next_logbook"
    val previousLogbook = "previous_logbook"
    val logbookRawMessage = "logbook_raw_message"
    val firstAndLastTripDates = "first_and_last_trip_dates"
    val vesselTrack = "vessel_track"
    val vesselsPositions = "vessels_positions"
    val vesselsAllPositions = "vessels_all_position"
    val vesselsPositionsWithBeaconMalfunctions = "vessels_positions_with_beacon_malfunctions"
    val infractions = "infractions"
    val infraction = "infraction"
    val currentSegments = "current_segment"
    val controlAnteriority = "control_anteriority"
    val controlUnits = "control_units"
    val riskFactors = "risk_factors"
    val faoAreas = "fao_areas"
    val findBeacon = "find_beacon"
    val district = "district"
    val missionControlUnits = "mission_control_units"
    val userAuthorization = "user_authorization"

    @Bean
    fun cacheManager(ticker: Ticker): CacheManager? {
        val oneWeek = 10080
        val oneDay = 1440

        val logbookCache = buildMinutesCache(logbook, ticker, 10)
        val nextLogbookCache = buildMinutesCache(nextLogbook, ticker, 10)
        val previousLogbookCache = buildMinutesCache(previousLogbook, ticker, 10)
        val firstAndLastTripDates = buildMinutesCache(firstAndLastTripDates, ticker, 10)
        val logbookRawMessageCache = buildMinutesCache(logbookRawMessage, ticker, oneWeek)
        val vesselCache = buildMinutesCache(vessels, ticker, 60)

        val gearCodeGroupsCache = buildMinutesCache(gearCodeGroups, ticker, oneWeek)
        val gearCodeGroupCache = buildMinutesCache(gearCodeGroup, ticker, oneWeek)

        val gearsCache = buildMinutesCache(gears, ticker, oneWeek)
        val gearCache = buildMinutesCache(gear, ticker, oneWeek)

        val allSpeciesCache = buildMinutesCache(allSpecies, ticker, oneWeek)
        val speciesCache = buildMinutesCache(species, ticker, oneWeek)
        val allSpeciesGroupsCache = buildMinutesCache(allSpeciesGroups, ticker, oneWeek)

        val portsCache = buildMinutesCache(ports, ticker, oneWeek)
        val activePortsCache = buildMinutesCache(activePorts, ticker, oneDay)
        val portCache = buildMinutesCache(port, ticker, oneWeek)

        val currentSegmentsCache = buildMinutesCache(currentSegments, ticker, 1)
        val controlAnteriorityCache = buildMinutesCache(controlAnteriority, ticker, 1)
        val riskFactorsCache = buildMinutesCache(riskFactors, ticker, 1)

        val faoAreasCache = buildMinutesCache(faoAreas, ticker, oneWeek)

        val districtCache = buildMinutesCache(district, ticker, 10)

        val infractionsCache = buildMinutesCache(infractions, ticker, oneWeek)
        val infractionCache = buildMinutesCache(infraction, ticker, oneWeek)

        val vesselTrackCache = buildMinutesCache(vesselTrack, ticker, 1)
        val vesselsPositionsCache = buildSecondsCache(vesselsPositions, ticker, 30)
        val vesselsAllPositionsCache = buildSecondsCache(vesselsAllPositions, ticker, 30)
        val vesselsPositionsWithBeaconMalfunctionsCache = buildMinutesCache(
            vesselsPositionsWithBeaconMalfunctions,
            ticker,
            1,
        )
        val searchVesselsCache = buildMinutesCache(searchVessels, ticker, 60)
        val searchBeaconsCache = buildMinutesCache(searchBeacons, ticker, 1)
        val findBeaconCache = buildMinutesCache(findBeacon, ticker, 60)

        val missionControlUnitsCache = buildMinutesCache(missionControlUnits, ticker, 120)
        val controlUnitsCache = buildMinutesCache(controlUnits, ticker, oneWeek)

        val userAuthorizationCache = buildMinutesCache(userAuthorization, ticker, 120)

        val manager = SimpleCacheManager()
        manager.setCaches(
            listOf(
                vesselCache,
                vesselTrackCache,
                vesselsPositionsCache,
                vesselsAllPositionsCache,
                vesselsPositionsWithBeaconMalfunctionsCache,
                gearCodeGroupsCache,
                gearCodeGroupCache,
                gearsCache,
                gearCache,
                portsCache,
                activePortsCache,
                portCache,
                allSpeciesCache,
                speciesCache,
                searchVesselsCache,
                searchBeaconsCache,
                logbookCache,
                nextLogbookCache,
                previousLogbookCache,
                logbookRawMessageCache,
                infractionsCache,
                infractionCache,
                currentSegmentsCache,
                controlAnteriorityCache,
                riskFactorsCache,
                allSpeciesGroupsCache,
                faoAreasCache,
                districtCache,
                findBeaconCache,
                missionControlUnitsCache,
                controlUnitsCache,
                userAuthorizationCache,
                firstAndLastTripDates
            ),
        )

        return manager
    }

    private fun buildMinutesCache(name: String, ticker: Ticker, minutesToExpire: Int): CaffeineCache {
        return CaffeineCache(
            name,
            Caffeine.newBuilder()
                .expireAfterWrite(minutesToExpire.toLong(), TimeUnit.MINUTES)
                .recordStats()
                .ticker(ticker)
                .build(),
        )
    }

    private fun buildSecondsCache(name: String, ticker: Ticker, secondsToExpire: Int): CaffeineCache {
        return CaffeineCache(
            name,
            Caffeine.newBuilder()
                .expireAfterWrite(secondsToExpire.toLong(), TimeUnit.SECONDS)
                .recordStats()
                .ticker(ticker)
                .build(),
        )
    }

    @Bean
    fun ticker(): Ticker? {
        return Ticker.systemTicker()
    }
}
