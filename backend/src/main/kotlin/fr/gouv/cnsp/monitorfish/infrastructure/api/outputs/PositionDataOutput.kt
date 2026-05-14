package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.position.NetworkType
import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import java.time.ZonedDateTime

data class PositionDataOutput(
    val mmsi: String? = null,
    val flagState: CountryCode? = null,
    val latitude: Double,
    val longitude: Double,
    val speed: Double?,
    val course: Double?,
    val dateTime: ZonedDateTime,
    val destination: CountryCode? = null,
    val positionType: PositionType,
    val isManual: Boolean? = null,
    val isFishing: Boolean? = null,
    val isAtPort: Boolean? = null,
    val networkType: NetworkType? = null,
) {
    companion object {
        fun fromPosition(position: Position): PositionDataOutput =
            PositionDataOutput(
                mmsi = position.mmsi,
                dateTime = position.dateTime,
                latitude = position.latitude,
                longitude = position.longitude,
                speed = position.speed,
                course = position.course,
                flagState = position.flagState,
                destination = position.destination,
                positionType = position.positionType,
                isManual = position.isManual,
                isFishing = position.isFishing,
                isAtPort = position.isAtPort,
                networkType = position.networkType,
            )
    }
}
