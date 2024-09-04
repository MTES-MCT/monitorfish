package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.BeaconEntity
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.query.Param

interface DBBeaconRepository : CrudRepository<BeaconEntity, String> {
    @Query(value = "SELECT * FROM beacons WHERE beacon_number LIKE %:searched% limit 20", nativeQuery = true)
    fun searchBy(
        @Param("searched") searched: String,
    ): List<BeaconEntity>

    fun findByVesselId(vesselId: Int): BeaconEntity

    @Query(
        value = "SELECT beacon_number FROM beacons WHERE beacon_status = CAST('ACTIVATED' AS beacon_status)",
        nativeQuery = true,
    )
    fun findActivatedBeaconNumbers(): List<String>
}
