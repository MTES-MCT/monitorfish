package fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.dtos

import fr.gouv.cnsp.monitorfish.domain.entities.administration.Administration
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.ControlUnitContact
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.ControlUnitDepartmentArea
import kotlinx.serialization.Serializable

@Serializable
data class FullControlUnit(
    val id: Int,
    val areaNote: String?,
    val administration: Administration,
    val administrationId: Int,
    val controlUnitContactIds: List<Int>,
    val controlUnitContacts: List<ControlUnitContact>,
    val controlUnitResourceIds: List<Int>,
    val controlUnitResources: List<FullControlUnitResource>,
    val departmentArea: ControlUnitDepartmentArea?,
    val departmentAreaInseeCode: String?,
    val isArchived: Boolean,
    val name: String,
    val termsNote: String?,
)
