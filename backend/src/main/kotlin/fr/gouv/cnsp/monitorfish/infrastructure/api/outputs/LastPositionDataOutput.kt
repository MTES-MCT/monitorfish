package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.PositionType
import java.time.Duration
import java.time.ZonedDateTime

data class LastPositionDataOutput(
        val internalReferenceNumber: String ? = null,
        val mmsi: String? = null,
        val ircs: String? = null,
        val externalReferenceNumber: String? = null,
        val vesselName: String? = null,
        val flagState: CountryCode? = null,
        val latitude: Double? = null,
        val longitude: Double? = null,
        val speed: Double? = null,
        val course: Double? = null,
        val dateTime: ZonedDateTime,
        val from: CountryCode? = null,
        val destination: CountryCode? = null,
        val tripNumber: Int? = null,
        val positionType: PositionType,
        val emissionPeriod: Duration? = null,
        val lastErsDateTime: ZonedDateTime? = null,
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
        val vesselIdentifier: String? = null) {
    companion object {
        fun fromLastPosition(position: LastPosition): LastPositionDataOutput {
            return LastPositionDataOutput(
                    internalReferenceNumber = position.internalReferenceNumber,
                    ircs = position.ircs,
                    mmsi = position.mmsi,
                    externalReferenceNumber = position.externalReferenceNumber,
                    dateTime = position.dateTime,
                    latitude = position.latitude,
                    longitude = position.longitude,
                    vesselName = position.vesselName,
                    speed = position.speed,
                    course = position.course,
                    flagState = position.flagState,
                    destination = position.destination,
                    from = position.from,
                    tripNumber = position.tripNumber,
                    positionType = position.positionType,
                    emissionPeriod = position.emissionPeriod,
                    lastErsDateTime = position.lastErsDateTime,
                    departureDateTime = position.departureDateTime,
                    width = position.width,
                    length = position.length,
                    registryPortName = position.registryPortName,
                    district = position.district,
                    districtCode = position.districtCode,
                    gearOnboard = position.gearOnboard?.map { GearLastPositionDataOutput.fromGearLastPosition(it) },
                    segments = position.segments,
                    speciesOnboard = position.speciesOnboard?.map { SpeciesLastPositionDataOutput.fromSpeciesLastPosition(it) },
                    totalWeightOnboard = position.totalWeightOnboard,
                    lastControlDateTime = position.lastControlDateTime,
                    lastControlInfraction = position.lastControlInfraction,
                    postControlComment = position.postControlComment,
                    vesselIdentifier = position.vesselIdentifier)
        }
    }
}
