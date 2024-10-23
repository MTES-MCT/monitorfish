package fr.gouv.cnsp.monitorfish.domain.entities.control_unit

data class ControlUnitStation(
    val id: Int,
    val latitude: Double,
    val longitude: Double,
    val name: String,
)
