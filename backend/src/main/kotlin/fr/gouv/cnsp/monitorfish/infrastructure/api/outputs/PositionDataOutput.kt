package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.Position
import java.time.ZonedDateTime

data class PositionDataOutput(
        val id: Int?,
        val IMEI: String,
        val latitude: Double,
        val longitude: Double,
        val speed: Double,
        val direction: Double,
        val positionDate: ZonedDateTime) {
    companion object {
        fun fromPosition(position: Position): PositionDataOutput {
            return PositionDataOutput(
                    id = position.id,
                    IMEI = position.IMEI,
                    latitude = position.latitude,
                    longitude = position.longitude,
                    speed =  position.speed,
                    direction = position.direction,
                    positionDate = position.positionDate
            )
        }
    }
}