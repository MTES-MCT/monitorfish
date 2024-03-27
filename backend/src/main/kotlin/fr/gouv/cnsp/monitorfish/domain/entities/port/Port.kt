package fr.gouv.cnsp.monitorfish.domain.entities.port

data class Port(
    val locode: String,
    val name: String,
    val facade: String? = null,
    val faoAreas: List<String> = emptyList(),
    val latitude: Double? = null,
    val longitude: Double? = null,
    val region: String? = null,
)
