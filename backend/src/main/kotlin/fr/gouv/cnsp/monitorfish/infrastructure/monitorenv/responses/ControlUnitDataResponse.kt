package fr.gouv.cnsp.monitorfish.infrastructure.monitorenv.responses

import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.ControlUnit
import kotlinx.serialization.Serializable

@Serializable
data class ControlUnitDataResponse(
    val id: Int,
    val areaNote: String?,
    val administrationId: Int,
    val departmentAreaInseeCode: String?,
    val isArchived: Boolean,
    val name: String,
    val termsNote: String?,
) {
    fun toControlUnit(): ControlUnit =
        ControlUnit(
            id = id,
            areaNote = areaNote,
            administrationId = administrationId,
            departmentAreaInseeCode = departmentAreaInseeCode,
            isArchived = isArchived,
            name = name,
            termsNote = termsNote,
        )
}
