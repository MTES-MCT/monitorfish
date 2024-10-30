package fr.gouv.cnsp.monitorfish.infrastructure.monitorenv.responses

import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.dtos.FullControlUnit
import kotlinx.serialization.Serializable

@Serializable
data class FullControlUnitDataResponse(
    val id: Int,
    val areaNote: String?,
    val administration: AdministrationDataResponse,
    val administrationId: Int,
    val controlUnitContactIds: List<Int>,
    val controlUnitContacts: List<ControlUnitContactDataResponse>,
    val controlUnitResourceIds: List<Int>,
    val controlUnitResources: List<FullControlUnitResourceDataResponse>,
    val departmentArea: ControlUnitDepartmentDataResponse?,
    val departmentAreaInseeCode: String?,
    val isArchived: Boolean,
    val name: String,
    val termsNote: String?,
) {
    fun toFullControlUnit(): FullControlUnit {
        return FullControlUnit(
            id = id,
            areaNote = areaNote,
            administration = administration.toAdministration(),
            administrationId = administrationId,
            controlUnitContactIds = controlUnitContactIds,
            controlUnitContacts = controlUnitContacts.map { it.toControlUnitContact() },
            controlUnitResourceIds = controlUnitResourceIds,
            controlUnitResources = controlUnitResources.map { it.toFullControlUnitResource() },
            departmentArea = departmentArea?.toControlUnitDepartmentArea(),
            departmentAreaInseeCode = departmentAreaInseeCode,
            isArchived = isArchived,
            name = name,
            termsNote = termsNote,
        )
    }
}
