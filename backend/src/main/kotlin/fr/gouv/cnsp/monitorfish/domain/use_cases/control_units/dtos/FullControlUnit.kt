package fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.dtos

import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.ControlUnitAdministration
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.ControlUnitContact
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.ControlUnitDepartmentArea
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.FullControlUnitResource

data class FullControlUnit(
    val id: Int,
    val areaNote: String?,
    val administration: ControlUnitAdministration,
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
