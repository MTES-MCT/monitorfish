package fr.gouv.cnsp.monitorfish.fakers

import fr.gouv.cnsp.monitorfish.domain.entities.port.Port

class PortFaker {
    companion object {
        fun fakePort(
            locode: String = "FRABC",
            countryCode: String? = "FR",
            facade: String? = null,
            faoAreas: List<String> = emptyList(),
            latitude: Double? = null,
            longitude: Double? = null,
            name: String = "Fake Port $locode",
            region: String? = null,
        ): Port {
            return Port(
                locode = locode,
                countryCode = countryCode,
                facade = facade,
                faoAreas = faoAreas,
                latitude = latitude,
                longitude = longitude,
                name = name,
                region = region,
            )
        }
    }
}
