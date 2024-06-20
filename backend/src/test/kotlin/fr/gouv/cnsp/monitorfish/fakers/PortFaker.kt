package fr.gouv.cnsp.monitorfish.fakers

import fr.gouv.cnsp.monitorfish.domain.entities.port.Port

class PortFaker {
    companion object {
        fun fakePort(portLocode: String = "FRABC"): Port {
            return Port(
                locode = portLocode,
                name = "Fake Port $portLocode",
                facade = null,
                faoAreas = emptyList(),
                latitude = null,
                longitude = null,
                region = null,
            )
        }
    }
}
