package fr.gouv.cnsp.monitorfish.domain.entities.vessel_group

data class VesselGroupFilters(
    val countryCodes: List<String>?,
    val fleetSegments: List<String>?,
    val gearCodes: List<String>?,
    val hasLogbook: Boolean?,
    val lastControlPeriod: LastControlPeriod?,
    val lastLandingPortLocodes: List<String>?,
    val lastPositionHoursAgo: Int?,
    val producerOrganizations: List<String>?,
    val riskFactors: List<Int>?,
    val specyCodes: List<String>?,
    val vesselSize: VesselSize?,
    val vesselsLocation: List<VesselLocation>?,
    val zones: List<ZoneFilter>?,
)
