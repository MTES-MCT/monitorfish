package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.fasterxml.jackson.annotation.JsonInclude
import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.coordinates.transformCoordinatesToOpenlayersProjection
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPositionAIS
import java.time.ZonedDateTime

// We remove null fields from the payload to reduce JSON size
@JsonInclude(JsonInclude.Include.NON_NULL)
class LastPositionAISDataOutput(
    val mmsi: Long,
    val imo: String? = null,
    val ircs: String? = null,
    val externalMarker: String? = null,
    val vesselName: String? = null,
    val vesselFeatureId: String,
    val flagState: CountryCode = CountryCode.UNDEFINED,
    val latitude: Double,
    val longitude: Double,
    val speed: Double? = null,
    val course: Double? = null,
    val dateTime: ZonedDateTime,
    val length: Double? = null,
    val isAtPort: Boolean = false,
    // Properties for WebGL
    val coordinates: List<Double>?,
    val lastPositionSentAt: Long,
    val destination: String? = null,
) {
    companion object {
        fun getVesselFeatureId(position: LastPositionAIS): String =
            "AIS_VESSELS_POINTS:${position.mmsi}/${position.imo ?: "UNKNOWN"}/${position.ircs ?: "UNKNOWN"}/${position.externalMarker ?: "UNKNOWN"}"

        fun fromLastPositionAIS(lastPosition: LastPositionAIS): LastPositionAISDataOutput =
            LastPositionAISDataOutput(
                mmsi = lastPosition.mmsi,
                imo = lastPosition.imo,
                ircs = lastPosition.ircs,
                externalMarker = lastPosition.externalMarker,
                vesselName = lastPosition.vesselName,
                vesselFeatureId = getVesselFeatureId(lastPosition),
                flagState = lastPosition.flagState,
                latitude = lastPosition.latitude,
                longitude = lastPosition.longitude,
                coordinates =
                    transformCoordinatesToOpenlayersProjection(
                        longitude = lastPosition.longitude,
                        latitude = lastPosition.latitude,
                    )?.toList(),
                lastPositionSentAt = lastPosition.dateTime.toInstant().toEpochMilli(),
                speed = lastPosition.speed,
                course = lastPosition.course,
                dateTime = lastPosition.dateTime,
                length = lastPosition.length,
                isAtPort = lastPosition.isAtPort,
                destination = lastPosition.destination,
            )
    }
}
