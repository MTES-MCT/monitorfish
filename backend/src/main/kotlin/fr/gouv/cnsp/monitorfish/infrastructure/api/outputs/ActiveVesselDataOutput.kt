package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.fasterxml.jackson.annotation.JsonInclude
import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.coordinates.transformCoordinatesToOpenlayersProjection
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ActiveVesselType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ActiveVesselWithReferentialData
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.Duration
import java.time.ZonedDateTime

/**
 * We remove null fields from the payload to reduce JSON size.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
sealed class ActiveVesselBaseDataOutput(
    open val id: Int? = null,
    open val vesselId: Int? = null,
    open val vesselFeatureId: String,
    open val activeVesselType: ActiveVesselType,
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
    open val lastControlDateTime: ZonedDateTime? = null,
    open val lastControlInfraction: Boolean? = null,
    open val vesselIdentifier: VesselIdentifier,
    open val impactRiskFactor: Double,
    open val probabilityRiskFactor: Double,
    open val detectabilityRiskFactor: Double,
    open val riskFactor: Double,
    open val underCharter: Boolean? = null,
    open val isAtPort: Boolean,
    open val producerOrganizationMembership: String? = null,
    open val reportings: List<String> = listOf(),
    // Properties for efficient filtering in frontend
    open val isFiltered: Int, // 0 is False, 1 is True - for WebGL
    open val gearsArray: List<String>,
    open val hasInfractionSuspicion: Boolean,
    open val speciesArray: List<String>,
) {
    companion object {
        fun fromActiveVesselWithReferentialData(
            activeVesselWithReferentialData: ActiveVesselWithReferentialData,
        ): ActiveVesselBaseDataOutput =
            activeVesselWithReferentialData.lastPosition?.let { lastPosition ->
                ActiveVesselWithPositionDataOutput(
                    id = lastPosition.id,
                    vesselId = lastPosition.vesselId,
                    internalReferenceNumber = lastPosition.internalReferenceNumber,
                    ircs = lastPosition.ircs,
                    mmsi = lastPosition.mmsi,
                    externalReferenceNumber = lastPosition.externalReferenceNumber,
                    dateTime = lastPosition.dateTime,
                    latitude = lastPosition.latitude,
                    longitude = lastPosition.longitude,
                    estimatedCurrentLatitude = lastPosition.estimatedCurrentLatitude,
                    estimatedCurrentLongitude = lastPosition.estimatedCurrentLongitude,
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
                    segments = lastPosition.segments ?: listOf(),
                    speciesOnboard =
                        lastPosition.speciesOnboard?.map {
                            SpeciesLastPositionDataOutput.fromSpeciesLastPosition(
                                it,
                            )
                        } ?: listOf(),
                    lastControlDateTime = lastPosition.lastControlDateTime,
                    lastControlInfraction = lastPosition.lastControlInfraction,
                    vesselIdentifier = lastPosition.vesselIdentifier,
                    impactRiskFactor = lastPosition.impactRiskFactor,
                    probabilityRiskFactor = lastPosition.probabilityRiskFactor,
                    detectabilityRiskFactor = lastPosition.detectabilityRiskFactor,
                    riskFactor = lastPosition.riskFactor,
                    underCharter = lastPosition.underCharter,
                    isAtPort = lastPosition.isAtPort,
                    alerts = lastPosition.alerts ?: listOf(),
                    beaconMalfunctionId = lastPosition.beaconMalfunctionId,
                    reportings = lastPosition.reportings,
                    coordinates =
                        transformCoordinatesToOpenlayersProjection(
                            longitude = lastPosition.longitude,
                            latitude = lastPosition.latitude,
                        ).toList(),
                    gearsArray = lastPosition.gearOnboard?.mapNotNull { it.gear }?.distinct() ?: listOf(),
                    hasAlert = lastPosition.alerts?.isNotEmpty() ?: false,
                    hasBeaconMalfunction = lastPosition.beaconMalfunctionId != null,
                    hasInfractionSuspicion =
                        lastPosition.reportings.any {
                            listOf(ReportingType.ALERT.name, ReportingType.INFRACTION_SUSPICION.name).contains(it)
                        },
                    isFiltered = 0,
                    lastPositionSentAt = lastPosition.dateTime.toInstant().toEpochMilli(),
                    speciesArray = lastPosition.speciesOnboard?.mapNotNull { it.species }?.distinct() ?: listOf(),
                    vesselFeatureId = Vessel.getVesselCompositeIdentifier(lastPosition),
                    vesselGroups =
                        activeVesselWithReferentialData.vesselGroups.map {
                            LastPositionVesselGroupDataOutput(
                                id = it.id!!,
                                color = it.color,
                                name = it.name,
                            )
                        },
                )
            } ?: run {
                require(activeVesselWithReferentialData.vessel != null) {
                    "A vessel must be found from the referential when a vessel profile is found."
                }

                ActiveVesselWithLogbookDataOutput(
                    id = activeVesselWithReferentialData.vessel.id,
                    vesselId = activeVesselWithReferentialData.vessel.id,
                    vesselFeatureId = activeVesselWithReferentialData.vessel.toVesselCompositeIdentifier(),
                    internalReferenceNumber = activeVesselWithReferentialData.vesselProfile?.cfr,
                    ircs = activeVesselWithReferentialData.vessel.ircs,
                    mmsi = activeVesselWithReferentialData.vessel.mmsi,
                    externalReferenceNumber = activeVesselWithReferentialData.vessel.externalReferenceNumber,
                    vesselName = activeVesselWithReferentialData.vessel.vesselName,
                    flagState = activeVesselWithReferentialData.vessel.flagState,
                    lastLogbookMessageDateTime = null,
                    length = activeVesselWithReferentialData.vessel.length,
                    district = activeVesselWithReferentialData.vessel.district,
                    districtCode = activeVesselWithReferentialData.vessel.districtCode,
                    speciesOnboard =
                        activeVesselWithReferentialData.riskFactor.speciesOnboard.map {
                            SpeciesLastPositionDataOutput.fromSpeciesLastPosition(
                                it,
                            )
                        },
                    lastControlDateTime = activeVesselWithReferentialData.riskFactor.lastControlDatetime,
                    // TODO add last infraction
                    lastControlInfraction = null,
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    impactRiskFactor = activeVesselWithReferentialData.riskFactor.impactRiskFactor,
                    probabilityRiskFactor = activeVesselWithReferentialData.riskFactor.probabilityRiskFactor,
                    detectabilityRiskFactor = activeVesselWithReferentialData.riskFactor.detectabilityRiskFactor,
                    riskFactor = activeVesselWithReferentialData.riskFactor.riskFactor,
                    underCharter = activeVesselWithReferentialData.vessel.underCharter,
                    isAtPort = false,
                    isFiltered = 0,
                    // TODO add reportings
                    reportings = listOf(),
                    gearsArray =
                        activeVesselWithReferentialData.riskFactor.gearOnboard
                            .mapNotNull { it.gear }
                            .distinct(),
                    hasInfractionSuspicion = false,
                    speciesArray =
                        activeVesselWithReferentialData.riskFactor.speciesOnboard
                            .mapNotNull { it.species }
                            .distinct(),
                )
            }
    }
}

data class ActiveVesselWithPositionDataOutput(
    override val id: Int? = null,
    override val vesselId: Int? = null,
    override val vesselFeatureId: String,
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
    override val lastControlDateTime: ZonedDateTime? = null,
    override val lastControlInfraction: Boolean? = null,
    override val vesselIdentifier: VesselIdentifier,
    override val impactRiskFactor: Double,
    override val probabilityRiskFactor: Double,
    override val detectabilityRiskFactor: Double,
    override val riskFactor: Double,
    override val underCharter: Boolean? = null,
    override val isAtPort: Boolean,
    override val producerOrganizationMembership: String? = null,
    override val reportings: List<String> = listOf(),
    // Properties for efficient filtering in frontend
    override val gearsArray: List<String>,
    override val hasInfractionSuspicion: Boolean,
    override val speciesArray: List<String>,
    override val isFiltered: Int, // 0 is False, 1 is True - for WebGL
    val alerts: List<String>,
    val hasAlert: Boolean,
    val beaconMalfunctionId: Int? = null,
    val segments: List<String>,
    val estimatedCurrentLatitude: Double? = null,
    val estimatedCurrentLongitude: Double? = null,
    val latitude: Double,
    val longitude: Double,
    val speed: Double? = null,
    val course: Double? = null,
    val dateTime: ZonedDateTime,
    val positionType: PositionType,
    val emissionPeriod: Duration? = null,
    // Properties for WebGL
    val coordinates: List<Double>,
    val hasBeaconMalfunction: Boolean,
    val lastPositionSentAt: Long,
    val vesselGroups: List<LastPositionVesselGroupDataOutput>,
) : ActiveVesselBaseDataOutput(
        id = id,
        vesselId = vesselId,
        vesselFeatureId = vesselFeatureId,
        activeVesselType = ActiveVesselType.POSITION_ACTIVITY,
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
        lastControlDateTime = lastControlDateTime,
        lastControlInfraction = lastControlInfraction,
        vesselIdentifier = vesselIdentifier,
        impactRiskFactor = impactRiskFactor,
        probabilityRiskFactor = probabilityRiskFactor,
        detectabilityRiskFactor = detectabilityRiskFactor,
        riskFactor = riskFactor,
        underCharter = underCharter,
        isAtPort = isAtPort,
        isFiltered = isFiltered,
        producerOrganizationMembership = producerOrganizationMembership,
        reportings = reportings,
        gearsArray = gearsArray,
        hasInfractionSuspicion = hasInfractionSuspicion,
        speciesArray = speciesArray,
    )

data class ActiveVesselWithLogbookDataOutput(
    override val id: Int? = null,
    override val vesselId: Int? = null,
    override val vesselFeatureId: String,
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
    override val lastControlDateTime: ZonedDateTime? = null,
    override val lastControlInfraction: Boolean? = null,
    override val vesselIdentifier: VesselIdentifier,
    override val impactRiskFactor: Double,
    override val probabilityRiskFactor: Double,
    override val detectabilityRiskFactor: Double,
    override val riskFactor: Double,
    override val underCharter: Boolean? = null,
    override val isAtPort: Boolean,
    override val producerOrganizationMembership: String? = null,
    override val reportings: List<String> = listOf(),
    // Properties for efficient filtering in frontend
    override val isFiltered: Int, // 0 is False, 1 is True - for WebGL
    override val gearsArray: List<String>,
    override val hasInfractionSuspicion: Boolean,
    override val speciesArray: List<String>,
) : ActiveVesselBaseDataOutput(
        id = id,
        vesselId = vesselId,
        vesselFeatureId = vesselFeatureId,
        activeVesselType = ActiveVesselType.LOGBOOK_ACTIVITY,
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
        lastControlDateTime = lastControlDateTime,
        lastControlInfraction = lastControlInfraction,
        vesselIdentifier = vesselIdentifier,
        impactRiskFactor = impactRiskFactor,
        probabilityRiskFactor = probabilityRiskFactor,
        detectabilityRiskFactor = detectabilityRiskFactor,
        riskFactor = riskFactor,
        underCharter = underCharter,
        isAtPort = isAtPort,
        producerOrganizationMembership = producerOrganizationMembership,
        reportings = reportings,
        gearsArray = gearsArray,
        hasInfractionSuspicion = hasInfractionSuspicion,
        speciesArray = speciesArray,
        isFiltered = isFiltered,
    )

data class LastPositionVesselGroupDataOutput(
    val id: Int,
    val color: String,
    val name: String,
)
