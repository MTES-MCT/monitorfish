package fr.gouv.cnsp.monitorfish.domain.entities.mission

import kotlinx.serialization.Serializable

@Serializable
data class ControlUnit(
    val id: Int,
    val administration: String,
    val name: String,
    val resources: List<ControlResource>,
    val contact: String? = null,
)
