package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.coordinates.transformCoordinatesToOpenlayersProjection
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.Duration
import java.time.ZonedDateTime

data class LastPositionDataOutput(
    val vesselId: Int? = null,
    val internalReferenceNumber: String? = null,
    val mmsi: String? = null,
    val ircs: String? = null,
    val externalReferenceNumber: String? = null,
    val vesselName: String? = null,
    val flagState: CountryCode,
    val latitude: Double,
    val longitude: Double,
    val estimatedCurrentLatitude: Double? = null,
    val estimatedCurrentLongitude: Double? = null,
    val speed: Double? = null,
    val course: Double? = null,
    val dateTime: ZonedDateTime,
    val tripNumber: String? = null,
    val positionType: PositionType,
    val emissionPeriod: Duration? = null,
    val lastLogbookMessageDateTime: ZonedDateTime? = null,
    val departureDateTime: ZonedDateTime? = null,
    val width: Double? = null,
    val length: Double? = null,
    val registryPortName: String? = null,
    val district: String? = null,
    val districtCode: String? = null,
    val gearOnboard: List<GearLastPositionDataOutput>,
    val segments: List<String>,
    val speciesOnboard: List<SpeciesLastPositionDataOutput>,
    val totalWeightOnboard: Double,
    val lastControlDateTime: ZonedDateTime? = null,
    val lastControlInfraction: Boolean? = null,
    val postControlComment: String? = null,
    val vesselIdentifier: VesselIdentifier,
    val impactRiskFactor: Double,
    val probabilityRiskFactor: Double,
    val detectabilityRiskFactor: Double,
    val riskFactor: Double,
    val underCharter: Boolean? = null,
    val isAtPort: Boolean,
    val alerts: List<String>,
    val beaconMalfunctionId: Int? = null,
    val vesselFeatureId: String,
    val reportings: List<String> = listOf(),
    // Properties for efficient filtering in frontend
    val gearsArray: List<String>,
    val hasAlert: Boolean,
    val hasInfractionSuspicion: Boolean,
    val lastControlDateTimeTimestamp: Long?,
    val speciesArray: List<String>,
    // Properties for WebGL
    val coordinates: List<Double>,
    val hasBeaconMalfunction: Boolean,
    val isFiltered: Int, // 0 is False, 1 is True - for WebGL
    val lastPositionSentAt: Long,
    val vesselGroups: List<LastPositionVesselGroupDataOutput>,
) {
    companion object {
        fun fromLastPosition(position: LastPosition): LastPositionDataOutput =
            LastPositionDataOutput(
                vesselId = position.vesselId,
                internalReferenceNumber = position.internalReferenceNumber,
                ircs = position.ircs,
                mmsi = position.mmsi,
                externalReferenceNumber = position.externalReferenceNumber,
                dateTime = position.dateTime,
                latitude = position.latitude,
                longitude = position.longitude,
                estimatedCurrentLatitude = position.estimatedCurrentLatitude,
                estimatedCurrentLongitude = position.estimatedCurrentLongitude,
                vesselName = position.vesselName,
                speed = position.speed,
                course = position.course,
                flagState = position.flagState,
                tripNumber = position.tripNumber,
                positionType = position.positionType,
                emissionPeriod = position.emissionPeriod,
                lastLogbookMessageDateTime = position.lastLogbookMessageDateTime,
                departureDateTime = position.departureDateTime,
                width = position.width,
                length = position.length,
                registryPortName = position.registryPortName,
                district = position.district,
                districtCode = position.districtCode,
                gearOnboard =
                    position.gearOnboard?.map { GearLastPositionDataOutput.fromGearLastPosition(it) }
                        ?: listOf(),
                segments = position.segments ?: listOf(),
                speciesOnboard =
                    position.speciesOnboard?.map {
                        SpeciesLastPositionDataOutput.fromSpeciesLastPosition(
                            it,
                        )
                    } ?: listOf(),
                totalWeightOnboard = position.totalWeightOnboard,
                lastControlDateTime = position.lastControlDateTime,
                lastControlInfraction = position.lastControlInfraction,
                postControlComment = position.postControlComment,
                vesselIdentifier = position.vesselIdentifier,
                impactRiskFactor = position.impactRiskFactor,
                probabilityRiskFactor = position.probabilityRiskFactor,
                detectabilityRiskFactor = position.detectabilityRiskFactor,
                riskFactor = position.riskFactor,
                underCharter = position.underCharter,
                isAtPort = position.isAtPort,
                alerts = position.alerts ?: listOf(),
                beaconMalfunctionId = position.beaconMalfunctionId,
                reportings = position.reportings,
                coordinates =
                    transformCoordinatesToOpenlayersProjection(
                        longitude = position.longitude,
                        latitude = position.latitude,
                    ).toList(),
                gearsArray = position.gearOnboard?.mapNotNull { it.gear }?.distinct() ?: listOf(),
                hasAlert = position.alerts?.isNotEmpty() ?: false,
                hasBeaconMalfunction = position.beaconMalfunctionId != null,
                hasInfractionSuspicion =
                    position.reportings.any {
                        listOf(ReportingType.ALERT.name, ReportingType.INFRACTION_SUSPICION.name).contains(it)
                    },
                isFiltered = 0,
                lastControlDateTimeTimestamp = position.lastControlDateTime?.toInstant()?.toEpochMilli(),
                lastPositionSentAt = position.dateTime.toInstant().toEpochMilli(),
                speciesArray = position.speciesOnboard?.mapNotNull { it.species }?.distinct() ?: listOf(),
                vesselFeatureId = Vessel.getVesselCompositeIdentifier(position),
                vesselGroups =
                    position.vesselGroups.map {
                        LastPositionVesselGroupDataOutput(
                            id = it.id!!,
                            color = it.color,
                            name = it.name,
                        )
                    },
            )
    }
}

data class LastPositionVesselGroupDataOutput(
    val id: Int,
    val color: String,
    val name: String,
)
