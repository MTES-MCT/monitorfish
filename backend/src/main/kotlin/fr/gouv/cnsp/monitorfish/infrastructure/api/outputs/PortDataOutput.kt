package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.port.Port

data class PortDataOutput(
    val locode: String?,
    val name: String?,
    val latitude: Double?,
    val longitude: Double?,
    val region: String?,
) {
    companion object {
        fun fromPort(port: Port) =
            PortDataOutput(
                locode = port.locode,
                name = port.name,
                latitude = port.latitude,
                longitude = port.longitude,
                region = port.region,
            )
    }
}
