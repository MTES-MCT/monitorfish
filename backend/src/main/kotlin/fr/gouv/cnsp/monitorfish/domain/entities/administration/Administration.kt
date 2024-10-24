package fr.gouv.cnsp.monitorfish.domain.entities.administration

import kotlinx.serialization.Serializable

@Serializable
data class Administration(
    val id: Int,
    val isArchived: Boolean,
    val name: String,
)
