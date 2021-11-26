package fr.gouv.cnsp.monitorfish.domain.entities

data class ControlObjective(
        val id: Int,
        val facade: String?,
        val segment: String?,
        val year: Int?,
        val targetNumberOfControlsAtSea: Int,
        val targetNumberOfControlsAtPort: Int,
        val controlPriorityLevel: Double
)
