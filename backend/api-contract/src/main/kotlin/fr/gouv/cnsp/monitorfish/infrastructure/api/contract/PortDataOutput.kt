package fr.gouv.cnsp.monitorfish.infrastructure.api.contract

data class PortDataOutput(
    val locode: String,
    val name: String,
    val latitude: Double?,
    val longitude: Double?,
    val region: String?,
)
