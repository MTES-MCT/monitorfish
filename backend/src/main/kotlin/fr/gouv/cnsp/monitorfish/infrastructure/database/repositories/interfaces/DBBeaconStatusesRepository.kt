package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.BeaconStatusEntity
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.time.ZonedDateTime

interface DBBeaconStatusesRepository : CrudRepository<BeaconStatusEntity, Int> {
    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE beacon_statuses SET vessel_status = CAST(:vesselStatus AS beacon_statuses_vessel_status), vessel_status_last_modification_date_utc = :updateDateTime WHERE id = :beaconStatusId", nativeQuery = true)
    fun updateVesselStatus(beaconStatusId: Int, vesselStatus: String, updateDateTime: ZonedDateTime)

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE beacon_statuses SET stage = CAST(:stage AS beacon_statuses_stage), vessel_status_last_modification_date_utc = :updateDateTime WHERE id = :beaconStatusId", nativeQuery = true)
    fun updateStage(beaconStatusId: Int, stage: String, updateDateTime: ZonedDateTime)
}
