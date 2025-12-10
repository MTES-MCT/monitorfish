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
    // Beacons
    val findBeacon = "find_beacon"
    val searchBeacons = "search_beacons"

    // Control Units
    val controlUnits = "control_units"
    val legacyControlUnits = "legacy_control_units"

    // FAO Areas
    val faoAreas = "fao_areas"
    val faoAreasSortedByUsage = "fao_areas_sorted_by_usage"

    // Gears
    val gear = "gear"
    val gearCodeGroup = "gear_code_group"
    val gearCodeGroups = "gear_code_groups"
    val gears = "gears"

    // Infractions
    val infraction = "infraction"
    val infractions = "infractions"
    val threatCharacterization = "threat_characterization"

    // Logbook Reports (Logbook Messages)
    val lastLogbookOperationDate = "last_logbook_operation_datetime_utc"
    val logbook = "logbook_messages"
    val logbookRawMessage = "logbook_raw_message"
    val pnoTypes = "pno_types"
    val logbookPnoTypes = "logbook_pno_types"
    val pnoToVerify = "pno_to_verify"
    val manualPnoToVerify = "manual_pno_to_verify"
    val allVisioCapturesVessels = "all_visiocaptures_vessels"

    // Missions
    val missionControlUnits = "mission_control_units"

    // Ports
    val activePorts = "active_ports"
    val port = "port"
    val ports = "ports"

    // Risk Factors
    val riskFactorByCfr = "risk_factor_by_cfr"
    val riskFactorByVesselId = "risk_factor_by_vessel_id"
    val riskFactors = "risk_factors"

    // Segments
    val currentSegments = "current_segments"
    val segmentsByYear = "segments_by_year"
    val segmentsWithGearsMeshCondition = "segments_with_gears_mesh_condition"

    // Species
    val allSpecies = "all_species"
    val allSpeciesGroups = "all_species_groups"
    val species = "species"

    // Vessels
    val searchVessels = "search_vessels"
    val vesselTrack = "vessel_track"
    val vessel = "vessel"
    val vesselProfile = "vessel_profile"
    val vessels = "vessels"
    val identifiableVessels = "identifiable_vessels"
    val vesselsAllPositions = "vessels_all_position"
    val vesselsByIds = "vessels_by_ids"
    val vesselsByInternalReferenceNumbers = "vessels_by_internal_reference_numbers"
    val activeVessels = "active_vessels"
    val activeVessel = "active_vessel"
    val vesselCharter = "vessel_charter"
    val vesselProducerOrganization = "vessel_producer_organization"
    val lastPositionDate = "last_position_date"
    val latestLastPositionDate = "latest_last_position_date"

    // Others
    val controlAnteriority = "control_anteriority"
    val district = "district"
    val districts = "districts"
    val allTrips = "all_trips"
    val suddenDropOfPositionsReceived = "sudden_drop_of_positions_received"
    val userAuthorization = "user_authorization"
    val smallChatScript = "smallchat_script"
    val userInfo = "user_info"

    @Bean
    fun cacheManager(ticker: Ticker): CacheManager? {
        val oneWeek = 10080
        val oneDay = 1440

        // Beacons
        val searchBeaconsCache = buildMinutesCache(searchBeacons, ticker, 1)
        val findBeaconCache = buildMinutesCache(findBeacon, ticker, 60)

        // Control Units
        val controlUnitsCache = buildMinutesCache(controlUnits, ticker, oneDay)
        val legacyControlUnitsCache = buildMinutesCache(legacyControlUnits, ticker, oneDay)

        // FAO Areas
        val faoAreasCache = buildMinutesCache(faoAreas, ticker, oneWeek)
        val faoAreasSortedByUsageCache = buildMinutesCache(faoAreasSortedByUsage, ticker, oneDay)

        // Gears
        val gearsCache = buildMinutesCache(gears, ticker, oneWeek)
        val gearCache = buildMinutesCache(gear, ticker, oneWeek)
        val gearCodeGroupsCache = buildMinutesCache(gearCodeGroups, ticker, oneWeek)
        val gearCodeGroupCache = buildMinutesCache(gearCodeGroup, ticker, oneWeek)

        // Infractions
        val infractionsCache = buildMinutesCache(infractions, ticker, oneWeek)
        val infractionCache = buildMinutesCache(infraction, ticker, oneWeek)
        val threatCharacterizationCache = buildMinutesCache(threatCharacterization, ticker, oneWeek)

        // Logbook Reports (Logbook Messages)
        val lastLogbookOperationDateCache = buildMinutesCache(lastLogbookOperationDate, ticker, 1)
        val logbookCache = buildMinutesCache(logbook, ticker, 10)
        val logbookRawMessageCache = buildMinutesCache(logbookRawMessage, ticker, oneWeek)

        val pnoToVerifyCache = buildMinutesCache(pnoToVerify, ticker, 5)
        val manualPnoToVerifyCache = buildMinutesCache(manualPnoToVerify, ticker, 5)
        val pnoTypesCache = buildMinutesCache(pnoTypes, ticker, 123)
        val logbookPnoTypesCache = buildMinutesCache(logbookPnoTypes, ticker, oneDay)
        val allVisioCapturesVesselsCache = buildMinutesCache(allVisioCapturesVessels, ticker, oneWeek)

        // Missions
        val missionControlUnitsCache = buildMinutesCache(missionControlUnits, ticker, 120)

        // Ports
        val portsCache = buildPermanentCache(ports)
        val activePortsCache = buildPermanentCache(activePorts)
        val portCache = buildPermanentCache(port)

        // Risk Factors
        val riskFactorByCfrCache = buildMinutesCache(riskFactorByCfr, ticker, 1)
        val riskFactorByVesselIdCache = buildMinutesCache(riskFactorByVesselId, ticker, 1)
        val riskFactorsCache = buildMinutesCache(riskFactors, ticker, 2)

        // Segments
        val currentSegmentsCache = buildMinutesCache(currentSegments, ticker, 1)
        val segmentsByYearCache = buildSecondsCache(segmentsByYear, ticker, 10)
        val segmentsWithGearsMeshConditionCache = buildSecondsCache(segmentsWithGearsMeshCondition, ticker, 10)

        // Species
        val allSpeciesCache = buildMinutesCache(allSpecies, ticker, oneWeek)
        val speciesCache = buildMinutesCache(species, ticker, oneWeek)
        val allSpeciesGroupsCache = buildMinutesCache(allSpeciesGroups, ticker, oneWeek)

        // Vessels
        val searchVesselsCache = buildMinutesCache(searchVessels, ticker, 60)
        val vesselTrackCache = buildMinutesCache(vesselTrack, ticker, 1)
        val vesselCache = buildMinutesCache(vessel, ticker, 60)
        val vesselProfileCache = buildMinutesCache(vesselProfile, ticker, 15)
        val vesselsCache = buildMinutesCache(vessels, ticker, 120)
        val identifiableVesselsCache = buildMinutesCache(identifiableVessels, ticker, 120)
        val vesselsByIdsCache = buildMinutesCache(vesselsByIds, ticker, 5)
        val vesselsByInternalReferenceNumbersCache =
            buildMinutesCache(vesselsByInternalReferenceNumbers, ticker, 5)
        val vesselsAllPositionsCache = buildSecondsCache(vesselsAllPositions, ticker, 30)
        val activeVesselsCache = buildSecondsCache(activeVessels, ticker, 60)
        val activeVesselCache = buildSecondsCache(activeVessel, ticker, 60)
        val vesselCharterCache = buildMinutesCache(vesselCharter, ticker, 30)
        val vesselProducerOrganizationCache = buildMinutesCache(vesselProducerOrganization, ticker, 120)
        val lastPositionDateCache = buildMinutesCache(lastPositionDate, ticker, 1)
        val latestLastPositionDateCache = buildMinutesCache(latestLastPositionDate, ticker, 1)

        // Others
        val controlAnteriorityCache = buildMinutesCache(controlAnteriority, ticker, 1)
        val districtCache = buildMinutesCache(district, ticker, 120)
        val districtsCache = buildMinutesCache(districts, ticker, 120)
        val allTripsCache = buildMinutesCache(allTrips, ticker, 10)
        val suddenDropOfPositionsReceivedCache = buildMinutesCache(suddenDropOfPositionsReceived, ticker, 2)
        val userAuthorizationCache = buildMinutesCache(userAuthorization, ticker, 120)
        val smallChatScriptCache = buildMinutesCache(smallChatScript, ticker, oneDay)
        val userInfoCache = buildMinutesCache(userInfo, ticker, 15)

        val manager = SimpleCacheManager()
        manager.setCaches(
            listOf(
                activePortsCache,
                allSpeciesCache,
                allSpeciesGroupsCache,
                controlAnteriorityCache,
                controlUnitsCache,
                currentSegmentsCache,
                segmentsByYearCache,
                segmentsWithGearsMeshConditionCache,
                districtCache,
                districtsCache,
                faoAreasCache,
                faoAreasSortedByUsageCache,
                findBeaconCache,
                allTripsCache,
                gearCache,
                gearCodeGroupCache,
                gearCodeGroupsCache,
                gearsCache,
                infractionCache,
                infractionsCache,
                threatCharacterizationCache,
                legacyControlUnitsCache,
                logbookCache,
                logbookRawMessageCache,
                missionControlUnitsCache,
                pnoTypesCache,
                logbookPnoTypesCache,
                allVisioCapturesVesselsCache,
                pnoToVerifyCache,
                manualPnoToVerifyCache,
                portCache,
                portsCache,
                riskFactorByCfrCache,
                riskFactorByVesselIdCache,
                riskFactorsCache,
                searchBeaconsCache,
                searchVesselsCache,
                smallChatScriptCache,
                speciesCache,
                suddenDropOfPositionsReceivedCache,
                userAuthorizationCache,
                vesselCache,
                vesselProfileCache,
                vesselsCache,
                identifiableVesselsCache,
                vesselTrackCache,
                vesselsAllPositionsCache,
                vesselsByIdsCache,
                vesselsByInternalReferenceNumbersCache,
                activeVesselsCache,
                activeVesselCache,
                vesselCharterCache,
                vesselProducerOrganizationCache,
                userInfoCache,
                lastLogbookOperationDateCache,
                lastPositionDateCache,
                latestLastPositionDateCache,
            ),
        )

        return manager
    }

    private fun buildMinutesCache(
        name: String,
        ticker: Ticker,
        minutesToExpire: Int,
    ): CaffeineCache =
        CaffeineCache(
            name,
            Caffeine
                .newBuilder()
                .expireAfterWrite(minutesToExpire.toLong(), TimeUnit.MINUTES)
                .recordStats()
                .ticker(ticker)
                .build(),
        )

    private fun buildPermanentCache(name: String): CaffeineCache =
        CaffeineCache(
            name,
            Caffeine
                .newBuilder()
                .recordStats()
                .build(),
        )

    private fun buildSecondsCache(
        name: String,
        ticker: Ticker,
        secondsToExpire: Int,
    ): CaffeineCache =
        CaffeineCache(
            name,
            Caffeine
                .newBuilder()
                .expireAfterWrite(secondsToExpire.toLong(), TimeUnit.SECONDS)
                .recordStats()
                .ticker(ticker)
                .build(),
        )

    @Bean
    fun ticker(): Ticker? = Ticker.systemTicker()
}
