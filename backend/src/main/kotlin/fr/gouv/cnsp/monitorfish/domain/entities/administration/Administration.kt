package fr.gouv.cnsp.monitorfish.domain.entities.administration

data class Administration(
    val id: Int,
    val isArchived: Boolean,
    val name: String,
)
