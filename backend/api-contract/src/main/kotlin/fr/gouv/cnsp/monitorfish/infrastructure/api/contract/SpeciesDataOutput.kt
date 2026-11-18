package fr.gouv.cnsp.monitorfish.infrastructure.api.contract

data class SpeciesDataOutput(
    val code: String,
    val name: String,
    val scipSpeciesType: ScipSpeciesType?,
)
