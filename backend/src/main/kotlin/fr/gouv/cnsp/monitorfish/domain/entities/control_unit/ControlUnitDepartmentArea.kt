package fr.gouv.cnsp.monitorfish.domain.entities.control_unit

// TODO Maybe merge `districts` from MonitorFish into MonitorEnv `departmentAreas`?
data class ControlUnitDepartmentArea(
    /** `inseeCode` is the ID. */
    val inseeCode: String,
    val name: String,
)
