package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
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
    val latitude: Double? = null,
    val longitude: Double? = null,
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
    val gearOnboard: List<GearLastPositionDataOutput>? = null,
    val segments: List<String>? = listOf(),
    val speciesOnboard: List<SpeciesLastPositionDataOutput>? = null,
    val totalWeightOnboard: Double? = null,
    val lastControlDateTime: ZonedDateTime? = null,
    val lastControlInfraction: Boolean? = null,
    val postControlComment: String? = null,
    val vesselIdentifier: VesselIdentifier,
    val impactRiskFactor: Double? = null,
    val probabilityRiskFactor: Double? = null,
    val detectabilityRiskFactor: Double? = null,
    val riskFactor: Double? = null,
    val underCharter: Boolean? = null,
    val isAtPort: Boolean? = null,
    val alerts: List<String>? = listOf(),
    val beaconMalfunctionId: Int? = null,
    val reportings: List<String> = listOf(),
) {
    companion object {
        fun fromLastPosition(position: LastPosition): LastPositionDataOutput {
            return LastPositionDataOutput(
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
                gearOnboard = position.gearOnboard?.map { GearLastPositionDataOutput.fromGearLastPosition(it) },
                segments = position.segments,
                speciesOnboard =
                    position.speciesOnboard?.map {
                        SpeciesLastPositionDataOutput.fromSpeciesLastPosition(
                            it,
                        )
                    },
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
                alerts = position.alerts,
                beaconMalfunctionId = position.beaconMalfunctionId,
                reportings = position.reportings,
            )
        }
    }
}
