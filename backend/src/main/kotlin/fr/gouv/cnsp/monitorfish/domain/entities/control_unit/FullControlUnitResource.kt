package fr.gouv.cnsp.monitorfish.domain.entities.control_unit

data class FullControlUnitResource(
    val id: Int,
    val controlUnit: ControlUnit,
    val controlUnitId: Int,
    val isArchived: Boolean,
    val name: String,
    val note: String?,
    val photo: ByteArray?,
    val station: ControlUnitStation,
    val stationId: Int,
    val type: ControlUnitResourceType,
)
