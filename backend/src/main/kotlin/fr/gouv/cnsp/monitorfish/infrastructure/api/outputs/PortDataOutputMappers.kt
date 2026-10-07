package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.PortDataOutput

fun Port.toPortDataOutput() =
    PortDataOutput(
        locode = locode,
        name = name,
        latitude = latitude,
        longitude = longitude,
        region = region,
    )
