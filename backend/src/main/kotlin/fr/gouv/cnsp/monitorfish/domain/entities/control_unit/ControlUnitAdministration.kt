package fr.gouv.cnsp.monitorfish.domain.entities.control_unit

data class ControlUnitAdministration(
    val id: Int,
    val isArchived: Boolean,
    val name: String,
)
