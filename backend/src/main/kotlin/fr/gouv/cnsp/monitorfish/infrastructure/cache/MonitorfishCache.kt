package fr.gouv.cnsp.monitorfish.infrastructure.cache

import kotlin.time.Duration
import kotlin.time.Duration.Companion.days
import kotlin.time.Duration.Companion.minutes
import kotlin.time.Duration.Companion.seconds

/** The method takes no argument, so the cache holds a single `SimpleKey.EMPTY` entry. */
private const val SINGLE_ENTRY = 1L

/** Keyed by an identifier from a closed referential (a code, a CFR, a vessel id). */
private const val BOUNDED_KEY = 10_000L

/** Keyed by free-form user input, or holding a large payload: kept deliberately tighter. */
private const val HEAVY_OR_FREE_FORM_KEY = 1_000L

private val NEVER_EXPIRES: Duration? = null

/**
 * Every cache of the application, with its eviction policy.
 *
 * Adding a cache here is all that is needed: [CaffeineConfiguration] builds and registers the whole
 * enum, so a cache can no longer be declared without being registered.
 */
enum class MonitorfishCache(
    val cacheName: String,
    val expiresAfterWrite: Duration?,
    val maximumSize: Long,
) {
    ACTIVE_PORTS(CacheName.ACTIVE_PORTS, NEVER_EXPIRES, SINGLE_ENTRY),
    ACTIVE_VESSEL(CacheName.ACTIVE_VESSEL, 60.seconds, BOUNDED_KEY),
    ACTIVE_VESSELS(CacheName.ACTIVE_VESSELS, 60.seconds, BOUNDED_KEY),
    ALL_SPECIES(CacheName.ALL_SPECIES, 7.days, SINGLE_ENTRY),
    ALL_SPECIES_GROUPS(CacheName.ALL_SPECIES_GROUPS, 7.days, SINGLE_ENTRY),
    ALL_TRIPS(CacheName.ALL_TRIPS, 10.minutes, HEAVY_OR_FREE_FORM_KEY),
    ALL_VISIOCAPTURES_VESSELS(CacheName.ALL_VISIOCAPTURES_VESSELS, 7.days, SINGLE_ENTRY),
    CONTROL_UNITS(CacheName.CONTROL_UNITS, 1.days, SINGLE_ENTRY),
    DISTRICT(CacheName.DISTRICT, 120.minutes, BOUNDED_KEY),
    DISTRICTS(CacheName.DISTRICTS, 120.minutes, SINGLE_ENTRY),
    FAO_AREAS(CacheName.FAO_AREAS, 7.days, SINGLE_ENTRY),
    FAO_AREAS_SORTED_BY_USAGE(CacheName.FAO_AREAS_SORTED_BY_USAGE, 1.days, SINGLE_ENTRY),
    FIND_BEACON(CacheName.FIND_BEACON, 60.minutes, BOUNDED_KEY),
    GEAR(CacheName.GEAR, 7.days, BOUNDED_KEY),
    GEAR_CODE_GROUP(CacheName.GEAR_CODE_GROUP, 7.days, BOUNDED_KEY),
    GEAR_CODE_GROUPS(CacheName.GEAR_CODE_GROUPS, 7.days, SINGLE_ENTRY),
    GEARS(CacheName.GEARS, 7.days, SINGLE_ENTRY),
    IDENTIFIABLE_VESSELS(CacheName.IDENTIFIABLE_VESSELS, 120.minutes, SINGLE_ENTRY),
    INFRACTION(CacheName.INFRACTION, 7.days, BOUNDED_KEY),
    INFRACTIONS(CacheName.INFRACTIONS, 7.days, SINGLE_ENTRY),
    LAST_DEP_CURRENT_TRIPS_BY_CFR(CacheName.LAST_DEP_CURRENT_TRIPS_BY_CFR, 5.minutes, BOUNDED_KEY),
    LAST_LOGBOOK_OPERATION_DATETIME_UTC(CacheName.LAST_LOGBOOK_OPERATION_DATETIME_UTC, 1.minutes, SINGLE_ENTRY),
    LAST_POSITION_DATE(CacheName.LAST_POSITION_DATE, 1.minutes, SINGLE_ENTRY),
    LATEST_LAST_POSITION_DATE(CacheName.LATEST_LAST_POSITION_DATE, 1.minutes, SINGLE_ENTRY),
    LEGACY_CONTROL_UNITS(CacheName.LEGACY_CONTROL_UNITS, 1.days, SINGLE_ENTRY),
    LOGBOOK_MESSAGES(CacheName.LOGBOOK_MESSAGES, 10.minutes, HEAVY_OR_FREE_FORM_KEY),
    LOGBOOK_PNO_TYPES(CacheName.LOGBOOK_PNO_TYPES, 1.days, SINGLE_ENTRY),
    LOGBOOK_RAW_MESSAGE(CacheName.LOGBOOK_RAW_MESSAGE, 7.days, HEAVY_OR_FREE_FORM_KEY),
    MANUAL_PNO_FOR_ACTIVE_VESSELS(CacheName.MANUAL_PNO_FOR_ACTIVE_VESSELS, 1.minutes, SINGLE_ENTRY),
    MANUAL_PNO_TO_VERIFY(CacheName.MANUAL_PNO_TO_VERIFY, 1.minutes, SINGLE_ENTRY),
    PNO_FOR_ACTIVE_VESSELS(CacheName.PNO_FOR_ACTIVE_VESSELS, 1.minutes, SINGLE_ENTRY),
    PNO_TO_VERIFY(CacheName.PNO_TO_VERIFY, 1.minutes, SINGLE_ENTRY),
    PNO_TYPES(CacheName.PNO_TYPES, 123.minutes, SINGLE_ENTRY),
    PORT(CacheName.PORT, NEVER_EXPIRES, BOUNDED_KEY),
    PORTS(CacheName.PORTS, NEVER_EXPIRES, SINGLE_ENTRY),
    RISK_FACTOR_BY_CFR(CacheName.RISK_FACTOR_BY_CFR, 1.minutes, BOUNDED_KEY),
    RISK_FACTOR_BY_VESSEL_ID(CacheName.RISK_FACTOR_BY_VESSEL_ID, 1.minutes, BOUNDED_KEY),
    RISK_FACTORS(CacheName.RISK_FACTORS, 2.minutes, SINGLE_ENTRY),
    SEARCH_BEACONS(CacheName.SEARCH_BEACONS, 1.minutes, HEAVY_OR_FREE_FORM_KEY),
    SEARCH_VESSELS(CacheName.SEARCH_VESSELS, 60.minutes, HEAVY_OR_FREE_FORM_KEY),
    SEGMENTS_BY_YEAR(CacheName.SEGMENTS_BY_YEAR, 10.seconds, BOUNDED_KEY),
    SEGMENTS_WITH_GEARS_MESH_CONDITION(CacheName.SEGMENTS_WITH_GEARS_MESH_CONDITION, 10.seconds, BOUNDED_KEY),
    SMALLCHAT_SCRIPT(CacheName.SMALLCHAT_SCRIPT, 1.days, SINGLE_ENTRY),
    SPECIES(CacheName.SPECIES, 7.days, BOUNDED_KEY),
    SUDDEN_DROP_OF_POSITIONS_RECEIVED(CacheName.SUDDEN_DROP_OF_POSITIONS_RECEIVED, 2.minutes, SINGLE_ENTRY),
    THREAT_CHARACTERIZATION(CacheName.THREAT_CHARACTERIZATION, 7.days, SINGLE_ENTRY),
    USER_AUTHORIZATION(CacheName.USER_AUTHORIZATION, 120.minutes, BOUNDED_KEY),
    VESSEL(CacheName.VESSEL, 60.minutes, BOUNDED_KEY),
    VESSEL_CHARTER(CacheName.VESSEL_CHARTER, 30.minutes, BOUNDED_KEY),
    VESSEL_PRODUCER_ORGANIZATION(CacheName.VESSEL_PRODUCER_ORGANIZATION, 120.minutes, BOUNDED_KEY),
    VESSEL_PROFILE(CacheName.VESSEL_PROFILE, 15.minutes, BOUNDED_KEY),
    VESSEL_TRACK(CacheName.VESSEL_TRACK, 1.minutes, HEAVY_OR_FREE_FORM_KEY),
    VESSELS(CacheName.VESSELS, 120.minutes, SINGLE_ENTRY),
    VESSELS_ALL_POSITION(CacheName.VESSELS_ALL_POSITION, 30.seconds, SINGLE_ENTRY),
    VESSELS_BY_IDS(CacheName.VESSELS_BY_IDS, 5.minutes, HEAVY_OR_FREE_FORM_KEY),
    VESSELS_BY_INTERNAL_REFERENCE_NUMBERS(
        CacheName.VESSELS_BY_INTERNAL_REFERENCE_NUMBERS,
        5.minutes,
        HEAVY_OR_FREE_FORM_KEY,
    ),
}
