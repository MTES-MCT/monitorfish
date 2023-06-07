package fr.gouv.cnsp.monitorfish.domain.entities.control_objective

data class ControlObjective(
    val id: Int? = null,
    val facade: String,
    val segment: String?,
    val year: Int?,
    val targetNumberOfControlsAtSea: Int,
    val targetNumberOfControlsAtPort: Int,
    val controlPriorityLevel: Double,
)
