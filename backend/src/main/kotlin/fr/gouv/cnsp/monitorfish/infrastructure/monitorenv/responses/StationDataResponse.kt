package fr.gouv.cnsp.monitorfish.infrastructure.monitorenv.responses

import fr.gouv.cnsp.monitorfish.domain.entities.station.Station
import kotlinx.serialization.Serializable

@Serializable
data class StationDataResponse(
    val id: Int,
    val latitude: Double,
    val longitude: Double,
    val name: String,
) {
    fun toStation(): Station =
        Station(
            id = id,
            latitude = latitude,
            longitude = longitude,
            name = name,
        )
}
