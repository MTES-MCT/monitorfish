package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.fasterxml.jackson.annotation.JsonInclude
import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ActivityOrigin
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ActivityType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.Duration
import java.time.ZonedDateTime

/**
 * Sent to thousands of vessels: null fields and the properties the frontend can rebuild from the others
 * (feature id, OpenLayers coordinates, WebGL flags... see `normalizeActiveVessel()`) are not sent,
 * to reduce the JSON size.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
sealed class ActiveVesselBaseDataOutput(
    open val id: Int? = null,
    open val vesselId: Int? = null,
    open val activityType: ActivityType,
    open val activityOrigin: ActivityOrigin,
    open val internalReferenceNumber: String? = null,
    open val mmsi: String? = null,
    open val ircs: String? = null,
    open val externalReferenceNumber: String? = null,
    open val vesselName: String? = null,
    open val flagState: CountryCode? = null,
    open val lastLogbookMessageDateTime: ZonedDateTime? = null,
    open val length: Double? = null,
    open val district: String? = null,
    open val districtCode: String? = null,
    open val speciesOnboard: List<SpeciesLastPositionDataOutput>,
    open val lastControlAtSeaDateTime: ZonedDateTime? = null,
    open val lastControlAtQuayDateTime: ZonedDateTime? = null,
    open val lastControlInfraction: Boolean? = null,
    open val vesselIdentifier: VesselIdentifier,
    open val impactRiskFactor: Double,
    open val probabilityRiskFactor: Double,
    open val detectabilityRiskFactor: Double,
    open val riskFactor: Double,
    open val segments: List<String>,
    open val underCharter: Boolean? = null,
    open val isAtPort: Boolean,
    open val producerOrganization: String? = null,
    // Properties for efficient filtering in frontend
    open val emitsPositions: Boolean,
    open val gearsArray: List<String>,
    open val hasInfractionSuspicion: Boolean,
    open val speciesArray: List<String>,
    open val landingPortLocode: String?,
    open val hasCurrentTripInfractionSuspicion: Boolean,
) {
    companion object {
        /** 5 decimals of a degree: ~1 m, while the estimated positions are computed with 15 decimals */
        private fun roundToAboutOneMeter(degrees: Double): Double =
            BigDecimal(degrees).setScale(5, RoundingMode.HALF_UP).toDouble()

        /**
         * @param indexInGroup Index of the vessel in its fixed vessel group (used to remove it from the group)
         */
        fun fromEnrichedActiveVessel(
            enrichedActiveVessel: EnrichedActiveVessel,
            indexInGroup: Int? = null,
        ): ActiveVesselBaseDataOutput =
            enrichedActiveVessel.lastPosition?.let { lastPosition ->
                val riskFactor =
                    RiskFactorDataOutput.fromVesselRiskFactor(
                        vesselRiskFactor = enrichedActiveVessel.riskFactor,
                        isRecentProfile = enrichedActiveVessel.activityOrigin == ActivityOrigin.FROM_RECENT_PROFILE,
                    )

                ActiveVesselEmittingPositionDataOutput(
                    id = indexInGroup,
                    vesselId = lastPosition.vesselId,
                    internalReferenceNumber = lastPosition.internalReferenceNumber,
                    ircs = lastPosition.ircs,
                    mmsi = lastPosition.mmsi,
                    externalReferenceNumber = lastPosition.externalReferenceNumber,
                    dateTime = lastPosition.dateTime,
                    latitude = lastPosition.latitude,
                    longitude = lastPosition.longitude,
                    estimatedCurrentLatitude = lastPosition.estimatedCurrentLatitude?.let(::roundToAboutOneMeter),
                    estimatedCurrentLongitude = lastPosition.estimatedCurrentLongitude?.let(::roundToAboutOneMeter),
                    vesselName = lastPosition.vesselName,
                    speed = lastPosition.speed,
                    course = lastPosition.course,
                    flagState = lastPosition.flagState,
                    positionType = lastPosition.positionType,
                    emissionPeriod = lastPosition.emissionPeriod,
                    lastLogbookMessageDateTime = lastPosition.lastLogbookMessageDateTime,
                    length = lastPosition.length,
                    district = lastPosition.district,
                    districtCode = lastPosition.districtCode,
                    segments = enrichedActiveVessel.segments,
                    speciesOnboard =
                        lastPosition.speciesOnboard?.map {
                            SpeciesLastPositionDataOutput.fromSpeciesLastPosition(
                                it,
                            )
                        } ?: listOf(),
                    lastControlAtSeaDateTime = enrichedActiveVessel.riskFactor.lastControlAtSeaDateTime,
                    lastControlAtQuayDateTime = enrichedActiveVessel.riskFactor.lastControlAtQuayDateTime,
                    lastControlInfraction = lastPosition.lastControlInfraction,
                    vesselIdentifier = lastPosition.vesselIdentifier,
                    impactRiskFactor = riskFactor.impactRiskFactor,
                    probabilityRiskFactor = riskFactor.probabilityRiskFactor,
                    detectabilityRiskFactor = riskFactor.detectabilityRiskFactor,
                    riskFactor = riskFactor.riskFactor,
                    underCharter = lastPosition.underCharter,
                    isAtPort = lastPosition.isAtPort,
                    alerts = lastPosition.alerts ?: listOf(),
                    beaconMalfunctionId = lastPosition.beaconMalfunctionId,
                    producerOrganization = enrichedActiveVessel.producerOrganization?.organizationName,
                    gearsArray = enrichedActiveVessel.gearsArray,
                    hasInfractionSuspicion = enrichedActiveVessel.hasInfractionSuspicion,
                    speciesArray = enrichedActiveVessel.speciesArray,
                    vesselGroups =
                        enrichedActiveVessel.vesselGroups.map {
                            LastPositionVesselGroupDataOutput(
                                id = it.id!!,
                                color = it.color,
                                name = it.name,
                                isPriorityGroup = it.isPriorityGroup,
                            )
                        },
                    activityType = enrichedActiveVessel.activityType,
                    activityOrigin = enrichedActiveVessel.activityOrigin,
                    landingPortLocode = enrichedActiveVessel.landingPort?.locode,
                    emitsPositions = enrichedActiveVessel.emitsPositions,
                    hasCurrentTripInfractionSuspicion = enrichedActiveVessel.hasCurrentTripInfractionSuspicion,
                )
            } ?: run {
                val riskFactor =
                    RiskFactorDataOutput.fromVesselRiskFactor(
                        vesselRiskFactor = enrichedActiveVessel.riskFactor,
                        isRecentProfile = enrichedActiveVessel.activityOrigin == ActivityOrigin.FROM_RECENT_PROFILE,
                    )

                ActiveVesselEmittingLogbookDataOutput(
                    id = indexInGroup,
                    vesselId = enrichedActiveVessel.vessel?.id,
                    internalReferenceNumber = enrichedActiveVessel.vesselProfile?.cfr,
                    ircs = enrichedActiveVessel.vessel?.ircs,
                    mmsi = enrichedActiveVessel.vessel?.mmsi,
                    externalReferenceNumber = enrichedActiveVessel.vessel?.externalReferenceNumber,
                    vesselName = enrichedActiveVessel.vessel?.vesselName,
                    flagState = enrichedActiveVessel.vessel?.flagState,
                    lastLogbookMessageDateTime = null,
                    length = enrichedActiveVessel.vessel?.length,
                    district = enrichedActiveVessel.vessel?.district,
                    districtCode = enrichedActiveVessel.vessel?.districtCode,
                    speciesOnboard =
                        enrichedActiveVessel.riskFactor.speciesOnboard.map {
                            SpeciesLastPositionDataOutput.fromSpeciesLastPosition(
                                it,
                            )
                        },
                    lastControlAtSeaDateTime = enrichedActiveVessel.riskFactor.lastControlAtSeaDateTime,
                    lastControlAtQuayDateTime = enrichedActiveVessel.riskFactor.lastControlAtQuayDateTime,
                    // TODO add last infraction
                    lastControlInfraction = null,
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    impactRiskFactor = riskFactor.impactRiskFactor,
                    probabilityRiskFactor = riskFactor.probabilityRiskFactor,
                    detectabilityRiskFactor = riskFactor.detectabilityRiskFactor,
                    riskFactor = riskFactor.riskFactor,
                    segments = enrichedActiveVessel.segments,
                    underCharter = enrichedActiveVessel.vessel?.underCharter,
                    isAtPort = false,
                    producerOrganization = enrichedActiveVessel.producerOrganization?.organizationName,
                    gearsArray = enrichedActiveVessel.gearsArray,
                    hasInfractionSuspicion = enrichedActiveVessel.hasInfractionSuspicion,
                    speciesArray = enrichedActiveVessel.speciesArray,
                    activityType = enrichedActiveVessel.activityType,
                    activityOrigin = enrichedActiveVessel.activityOrigin,
                    landingPortLocode = enrichedActiveVessel.landingPort?.locode,
                    emitsPositions = enrichedActiveVessel.emitsPositions,
                    hasCurrentTripInfractionSuspicion = enrichedActiveVessel.hasCurrentTripInfractionSuspicion,
                )
            }
    }
}

data class ActiveVesselEmittingPositionDataOutput(
    override val id: Int? = null,
    override val vesselId: Int? = null,
    override val internalReferenceNumber: String? = null,
    override val mmsi: String? = null,
    override val ircs: String? = null,
    override val activityType: ActivityType,
    override val activityOrigin: ActivityOrigin,
    override val externalReferenceNumber: String? = null,
    override val vesselName: String? = null,
    override val flagState: CountryCode? = null,
    override val lastLogbookMessageDateTime: ZonedDateTime? = null,
    override val length: Double? = null,
    override val district: String? = null,
    override val districtCode: String? = null,
    override val speciesOnboard: List<SpeciesLastPositionDataOutput>,
    override val lastControlAtSeaDateTime: ZonedDateTime? = null,
    override val lastControlAtQuayDateTime: ZonedDateTime? = null,
    override val lastControlInfraction: Boolean? = null,
    override val vesselIdentifier: VesselIdentifier,
    override val impactRiskFactor: Double,
    override val probabilityRiskFactor: Double,
    override val detectabilityRiskFactor: Double,
    override val riskFactor: Double,
    override val segments: List<String>,
    override val underCharter: Boolean? = null,
    override val isAtPort: Boolean,
    override val producerOrganization: String? = null,
    // Properties for efficient filtering in frontend
    override val gearsArray: List<String>,
    override val hasInfractionSuspicion: Boolean,
    override val speciesArray: List<String>,
    override val emitsPositions: Boolean,
    override val landingPortLocode: String?,
    override val hasCurrentTripInfractionSuspicion: Boolean,
    val alerts: List<String>,
    val beaconMalfunctionId: Int? = null,
    val estimatedCurrentLatitude: Double? = null,
    val estimatedCurrentLongitude: Double? = null,
    val latitude: Double,
    val longitude: Double,
    val speed: Double? = null,
    val course: Double? = null,
    val dateTime: ZonedDateTime,
    val positionType: PositionType,
    val emissionPeriod: Duration? = null,
    val vesselGroups: List<LastPositionVesselGroupDataOutput>,
) : ActiveVesselBaseDataOutput(
        id = id,
        vesselId = vesselId,
        internalReferenceNumber = internalReferenceNumber,
        mmsi = mmsi,
        ircs = ircs,
        externalReferenceNumber = externalReferenceNumber,
        vesselName = vesselName,
        flagState = flagState,
        lastLogbookMessageDateTime = lastLogbookMessageDateTime,
        length = length,
        district = district,
        districtCode = districtCode,
        speciesOnboard = speciesOnboard,
        lastControlAtSeaDateTime = lastControlAtSeaDateTime,
        lastControlAtQuayDateTime = lastControlAtQuayDateTime,
        lastControlInfraction = lastControlInfraction,
        vesselIdentifier = vesselIdentifier,
        impactRiskFactor = impactRiskFactor,
        probabilityRiskFactor = probabilityRiskFactor,
        detectabilityRiskFactor = detectabilityRiskFactor,
        riskFactor = riskFactor,
        segments = segments,
        underCharter = underCharter,
        isAtPort = isAtPort,
        emitsPositions = emitsPositions,
        producerOrganization = producerOrganization,
        gearsArray = gearsArray,
        hasInfractionSuspicion = hasInfractionSuspicion,
        speciesArray = speciesArray,
        activityType = activityType,
        activityOrigin = activityOrigin,
        landingPortLocode = landingPortLocode,
        hasCurrentTripInfractionSuspicion = hasCurrentTripInfractionSuspicion,
    )

data class ActiveVesselEmittingLogbookDataOutput(
    override val id: Int? = null,
    override val vesselId: Int? = null,
    override val activityType: ActivityType,
    override val activityOrigin: ActivityOrigin,
    override val internalReferenceNumber: String? = null,
    override val mmsi: String? = null,
    override val ircs: String? = null,
    override val externalReferenceNumber: String? = null,
    override val vesselName: String? = null,
    override val flagState: CountryCode? = null,
    override val lastLogbookMessageDateTime: ZonedDateTime? = null,
    override val length: Double? = null,
    override val district: String? = null,
    override val districtCode: String? = null,
    override val speciesOnboard: List<SpeciesLastPositionDataOutput>,
    override val lastControlAtSeaDateTime: ZonedDateTime? = null,
    override val lastControlAtQuayDateTime: ZonedDateTime? = null,
    override val lastControlInfraction: Boolean? = null,
    override val vesselIdentifier: VesselIdentifier,
    override val impactRiskFactor: Double,
    override val probabilityRiskFactor: Double,
    override val detectabilityRiskFactor: Double,
    override val riskFactor: Double,
    override val segments: List<String>,
    override val underCharter: Boolean? = null,
    override val isAtPort: Boolean,
    override val producerOrganization: String? = null,
    override val landingPortLocode: String?,
    // Properties for efficient filtering in frontend
    override val gearsArray: List<String>,
    override val hasInfractionSuspicion: Boolean,
    override val speciesArray: List<String>,
    override val emitsPositions: Boolean,
    override val hasCurrentTripInfractionSuspicion: Boolean,
) : ActiveVesselBaseDataOutput(
        id = id,
        vesselId = vesselId,
        internalReferenceNumber = internalReferenceNumber,
        mmsi = mmsi,
        ircs = ircs,
        externalReferenceNumber = externalReferenceNumber,
        vesselName = vesselName,
        flagState = flagState,
        lastLogbookMessageDateTime = lastLogbookMessageDateTime,
        length = length,
        district = district,
        districtCode = districtCode,
        speciesOnboard = speciesOnboard,
        lastControlAtSeaDateTime = lastControlAtSeaDateTime,
        lastControlAtQuayDateTime = lastControlAtQuayDateTime,
        lastControlInfraction = lastControlInfraction,
        vesselIdentifier = vesselIdentifier,
        impactRiskFactor = impactRiskFactor,
        probabilityRiskFactor = probabilityRiskFactor,
        detectabilityRiskFactor = detectabilityRiskFactor,
        riskFactor = riskFactor,
        segments = segments,
        underCharter = underCharter,
        isAtPort = isAtPort,
        producerOrganization = producerOrganization,
        gearsArray = gearsArray,
        hasInfractionSuspicion = hasInfractionSuspicion,
        speciesArray = speciesArray,
        emitsPositions = emitsPositions,
        activityType = activityType,
        activityOrigin = activityOrigin,
        landingPortLocode = landingPortLocode,
        hasCurrentTripInfractionSuspicion = hasCurrentTripInfractionSuspicion,
    )

data class LastPositionVesselGroupDataOutput(
    val id: Int,
    val color: String,
    val name: String,
    val isPriorityGroup: Boolean,
)
