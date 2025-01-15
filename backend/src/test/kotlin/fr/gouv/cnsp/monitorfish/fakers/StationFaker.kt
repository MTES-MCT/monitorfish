package fr.gouv.cnsp.monitorfish.fakers

import fr.gouv.cnsp.monitorfish.domain.entities.station.Station

class StationFaker {
    companion object {
        fun fakeStation(
            id: Int = 1,
            latitude: Double = 48.8566,
            longitude: Double = 2.3522,
            name: String = "Fake Station Name",
        ): Station =
            Station(
                id = id,
                latitude = latitude,
                longitude = longitude,
                name = name,
            )
    }
}
