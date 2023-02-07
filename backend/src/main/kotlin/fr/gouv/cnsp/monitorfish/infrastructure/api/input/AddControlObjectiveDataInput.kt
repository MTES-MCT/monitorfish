package fr.gouv.cnsp.monitorfish.infrastructure.api.input

data class AddControlObjectiveDataInput(
    var segment: String,
    var facade: String,
    var year: Int,
)
