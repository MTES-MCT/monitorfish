package fr.gouv.cnsp.monitorfish.domain.entities.last_position

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.defaultDetectabilityRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.defaultImpactRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.defaultProbabilityRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.defaultRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.LastControlPeriod
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupBase
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselLocation
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselSize
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_profile.VesselProfile
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import java.time.Duration
import java.time.ZonedDateTime

data class LastPosition(
    val id: Int? = null,
    // Vessel identification properties
    val vesselId: Int? = null,
    // Unique code composed by the contracting party/cooperating non-contracting party expressed as 3-alpha
    // country code followed by the vessel registration number as recorded in the national fleet register
    val internalReferenceNumber: String? = null,
    // Maritime Mobile Service Identity (MMSI)
    val mmsi: String? = null,
    // International Radio Call Sign of the vessel (IRCS)
    val ircs: String? = null,
    // i.e side number, registration number, IMO number or any other external marking identifying the vessel
    val externalReferenceNumber: String? = null,
    val vesselName: String? = null,
    val flagState: CountryCode,
    val positionType: PositionType,
    val latitude: Double,
    val longitude: Double,
    val estimatedCurrentLatitude: Double? = null,
    val estimatedCurrentLongitude: Double? = null,
    val speed: Double? = null,
    val course: Double? = null,
    val dateTime: ZonedDateTime,
    val tripNumber: String? = null,
    val emissionPeriod: Duration? = null,
    val lastLogbookMessageDateTime: ZonedDateTime? = null,
    val departureDateTime: ZonedDateTime? = null,
    val width: Double? = null,
    val length: Double? = null,
    val registryPortName: String? = null,
    val district: String? = null,
    val districtCode: String? = null,
    val gearOnboard: List<Gear>? = listOf(),
    val segments: List<String>? = listOf(),
    val speciesOnboard: List<Species>? = listOf(),
    val totalWeightOnboard: Double = 0.0,
    val lastControlDateTime: ZonedDateTime? = null,
    val lastControlInfraction: Boolean? = null,
    val postControlComment: String? = null,
    val vesselIdentifier: VesselIdentifier,
    val impactRiskFactor: Double = defaultImpactRiskFactor,
    val probabilityRiskFactor: Double = defaultProbabilityRiskFactor,
    val detectabilityRiskFactor: Double = defaultDetectabilityRiskFactor,
    val riskFactor: Double = defaultRiskFactor,
    val underCharter: Boolean? = null,
    val isAtPort: Boolean = false,
    val alerts: List<String>? = listOf(),
    val beaconMalfunctionId: Int? = null,
    val reportings: List<String> = listOf(),
) {
    fun isInGroup(
        vesselGroup: VesselGroupBase,
        profile: VesselProfile?,
        now: ZonedDateTime,
    ): Boolean {
        if (vesselGroup !is DynamicVesselGroup) return false

        val filters = vesselGroup.filters

        val vesselsLocation = filters.vesselsLocation.singleOrNull()

        val hasCountryCodeMatch = filters.countryCodes.isEmpty() || this.flagState in filters.countryCodes

        val hasDistrictCodeMatch =
            filters.districtCodes.isEmpty() || this.districtCode in filters.districtCodes

        val hasLastControlPeriodMatch =
            when (filters.lastControlPeriod) {
                LastControlPeriod.AFTER_ONE_MONTH_AGO ->
                    this.lastControlDateTime?.isAfter(now.minusMonths(1))
                        ?: false
                LastControlPeriod.BEFORE_ONE_MONTH_AGO ->
                    this.lastControlDateTime?.isBefore(now.minusMonths(1))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_ONE_YEAR_AGO ->
                    this.lastControlDateTime?.isBefore(now.minusYears(1))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_SIX_MONTHS_AGO ->
                    this.lastControlDateTime?.isBefore(now.minusMonths(6))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_THREE_MONTHS_AGO ->
                    this.lastControlDateTime?.isBefore(now.minusMonths(3))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_TWO_YEARS_AGO ->
                    this.lastControlDateTime?.isBefore(now.minusYears(2))
                        ?: true // If no control is found, it is before the expected date
                null -> true
            }

        val hasLogbookMatch =
            filters.hasLogbook?.let {
                this.lastLogbookMessageDateTime != null
            } ?: true

        val hasRiskFactorMatch =
            filters.riskFactors.isEmpty() ||
                filters.riskFactors.any { riskFactor ->
                    this.riskFactor in riskFactor.toDouble()..<(riskFactor + 1).toDouble()
                }

        val vesselIsHidden =
            filters.lastPositionHoursAgo?.let { now.minusHours(it.toLong()) } ?: now
        val hasLastPositionDateTimeMatch =
            filters.lastPositionHoursAgo?.let {
                this.dateTime.isAfter(vesselIsHidden)
            } ?: true

        val hasFleetSegmentMatch =
            filters.fleetSegments.isEmpty() ||
                (this.segments?.any { it in filters.fleetSegments } ?: false)

        val hasGearMatch =
            filters.gearCodes.isEmpty() ||
                (this.gearOnboard?.any { it.gear in filters.gearCodes } ?: false)

        val hasSpeciesMatch =
            filters.specyCodes.isEmpty() ||
                (this.speciesOnboard?.any { it.species in filters.specyCodes } ?: false)

        /**
         * IF
         *  a filter on segment or gear is set AND
         *  the current data is empty in last position (the vessel has not sent any FAR)
         * THEN
         *  compute the matches on the profile to obtain the recent segment or gear
         * ELSE
         *  Match the segments and gears based on the current data
         */
        val hasProfileFieldsMatch =
            if ((filters.fleetSegments.isNotEmpty() && this.segments?.isEmpty() == true) ||
                (filters.gearCodes.isNotEmpty() && this.gearOnboard?.isEmpty() == true)
            ) {
                profile?.isInGroup(vesselGroup) == true
            } else {
                hasFleetSegmentMatch && hasGearMatch
            }

        val hasVesselLocationMatch =
            vesselsLocation?.let {
                (it == VesselLocation.PORT && this.isAtPort) ||
                    (it == VesselLocation.SEA && !this.isAtPort)
            } ?: true

        val hasVesselLengthMatch =
            filters.vesselSize?.let {
                this.length?.let { length ->
                    when (it) {
                        VesselSize.ABOVE_TWELVE_METERS -> length >= 12
                        VesselSize.BELOW_TEN_METERS -> length <= 10
                        VesselSize.BELOW_TWELVE_METERS -> length <= 12
                    }
                } ?: false
            } ?: true

        val hasZoneMatch =
            filters.zones.takeIf { it.isNotEmpty() }?.let { zones ->
                val point = GeometryFactory().createPoint(Coordinate(this.longitude, this.latitude))

                return@let zones.any { zone ->
                    val polygon = GeometryFactory().createPolygon(zone.feature.coordinates)

                    // `envelopeInternal` is used to improve perf by checking first the bounding box before doing the actual contains
                    return@any polygon.envelopeInternal.contains(point.coordinates.first()) && polygon.contains(point)
                }
            } ?: true

        return hasCountryCodeMatch &&
            hasLastControlPeriodMatch &&
            hasDistrictCodeMatch &&
            hasLogbookMatch &&
            hasRiskFactorMatch &&
            hasLastPositionDateTimeMatch &&
            hasProfileFieldsMatch &&
            hasSpeciesMatch &&
            hasVesselLocationMatch &&
            hasVesselLengthMatch &&
            hasZoneMatch
    }
}
