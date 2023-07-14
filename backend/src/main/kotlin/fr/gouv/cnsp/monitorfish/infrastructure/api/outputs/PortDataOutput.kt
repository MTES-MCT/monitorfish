package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.port.Port

data class PortDataOutput(
    val locode: String? = null,
    val name: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
) {
    companion object {
        fun fromPort(port: Port) = PortDataOutput(
            locode = port.locode,
            name = port.name,
            latitude = port.latitude,
            longitude = port.longitude,
        )
    }
}
