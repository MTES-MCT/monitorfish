package fr.gouv.cnsp.monitorfish.domain.entities.vessel_group

import com.neovisionaries.i18n.CountryCode

data class VesselGroupFilters(
    val countryCodes: List<CountryCode> = listOf(),
    val districtCodes: List<String> = listOf(),
    val fleetSegments: List<String> = listOf(),
    val gearCodes: List<String> = listOf(),
    val emitsPositions: List<VesselEmitsPositions> = listOf(),
    val hasLogbook: Boolean?,
    val lastControlPeriod: LastControlPeriod?,
    // TODO Implement the filter
    val lastLandingPortLocodes: List<String> = listOf(),
    val lastPositionHoursAgo: Int?,
    val producerOrganizations: List<String> = listOf(),
    val riskFactors: List<Int> = listOf(),
    val specyCodes: List<String> = listOf(),
    val vesselSize: VesselSize?,
    val vesselsLocation: List<VesselLocation> = listOf(),
    val zones: List<ZoneFilter> = listOf(),
)
