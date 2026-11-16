package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

data class ReferentialVersionsDataOutput(
    val gears: String,
    val infractions: String,
    val ports: String,
    val regulations: String,
    val species: String,
)
