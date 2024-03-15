package fr.gouv.cnsp.monitorfish.domain.entities.port

data class Port(
    val locode: String,
    val name: String,
    val facade: String?,
    val faoAreas: List<String>,
    val latitude: Double?,
    val longitude: Double?,
    val region: String?,
)
