package fr.gouv.cnsp.monitorfish.domain.entities.control_unit

data class ControlUnit(
    val id: Int,
    val areaNote: String?,
    val administrationId: Int,
    val departmentAreaInseeCode: String?,
    val isArchived: Boolean,
    val name: String,
    val termsNote: String?,
)
