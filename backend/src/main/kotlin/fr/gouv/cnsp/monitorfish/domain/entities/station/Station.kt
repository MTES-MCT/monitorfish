package fr.gouv.cnsp.monitorfish.domain.entities.station

data class Station(
    val id: Int,
    val latitude: Double,
    val longitude: Double,
    val name: String,
)
