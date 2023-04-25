package fr.gouv.cnsp.monitorfish.domain.entities.mission

import kotlinx.serialization.Serializable

@Serializable
data class MultiPolygon(
    val type: String,
    val coordinates: List<List<List<List<Double>>>>,
)
