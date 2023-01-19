package fr.gouv.cnsp.monitorfish.domain.entities.mission

import kotlinx.serialization.Serializable

@Serializable
data class ControlResource(
    val id: Int,
    val name: String
)
