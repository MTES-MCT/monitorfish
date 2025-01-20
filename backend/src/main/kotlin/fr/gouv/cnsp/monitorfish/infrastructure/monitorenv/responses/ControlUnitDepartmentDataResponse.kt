package fr.gouv.cnsp.monitorfish.infrastructure.monitorenv.responses

import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.ControlUnitDepartmentArea
import kotlinx.serialization.Serializable

@Serializable
data class ControlUnitDepartmentDataResponse(
    /** `inseeCode` is the ID. */
    val inseeCode: String,
    val name: String,
) {
    fun toControlUnitDepartmentArea(): ControlUnitDepartmentArea =
        ControlUnitDepartmentArea(
            inseeCode = inseeCode,
            name = name,
        )
}
