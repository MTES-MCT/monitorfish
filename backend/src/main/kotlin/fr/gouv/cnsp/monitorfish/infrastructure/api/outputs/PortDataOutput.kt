package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.port.Port

data class PortDataOutput(
    var locode: String? = null,
    var name: String? = null,
) {
    companion object {
        fun fromPort(port: Port) = PortDataOutput(
            locode = port.locode,
            name = port.name,
        )
    }
}
