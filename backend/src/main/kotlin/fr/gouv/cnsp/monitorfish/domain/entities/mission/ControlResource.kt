package fr.gouv.cnsp.monitorfish.domain.entities.mission

import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.ControlUnitResourceType
import kotlinx.serialization.Serializable

@Serializable
data class ControlResource(
    val id: Int,
    val name: String,
    val type: ControlUnitResourceType,
)
