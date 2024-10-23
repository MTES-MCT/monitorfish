package fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.dtos

import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.ControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.ControlUnitResourceType
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.ControlUnitStation

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
