package fr.gouv.cnsp.monitorfish.domain.entities.control_unit

import kotlinx.serialization.Serializable

@Serializable
data class ControlUnitStation(
    val id: Int,
    val latitude: Double,
    val longitude: Double,
    val name: String,
)
