package fr.gouv.cnsp.monitorfish.domain.entities.control_unit

import kotlinx.serialization.Serializable

// TODO Maybe merge `districts` from MonitorFish into MonitorEnv `departmentAreas`?
@Serializable
data class ControlUnitDepartmentArea(
    /** `inseeCode` is the ID. */
    val inseeCode: String,
    val name: String,
)
