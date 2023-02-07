package fr.gouv.cnsp.monitorfish.infrastructure.api.input

data class UpdateControlObjectiveDataInput(
    var targetNumberOfControlsAtSea: Int? = null,
    var targetNumberOfControlsAtPort: Int? = null,
    var controlPriorityLevel: Double? = null,
)
