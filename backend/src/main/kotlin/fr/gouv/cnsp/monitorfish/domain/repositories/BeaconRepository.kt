package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.Beacon

interface BeaconRepository {
    fun search(searched: String): List<Beacon>
    fun findBeaconNumberByVesselId(vesselId: Int): String
}
