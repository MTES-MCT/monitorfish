package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.BeaconStatusEntity
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.time.Instant
import java.time.ZonedDateTime

interface DBBeaconStatusesRepository : CrudRepository<BeaconStatusEntity, Int> {
    @Query(value = "SELECT * FROM beacon_statuses where stage = 'RESUMED_TRANSMISSION' ORDER BY vessel_status_last_modification_date_utc DESC LIMIT 30", nativeQuery = true)
    fun findLastThirtyResumedTransmissions(): List<BeaconStatusEntity>

    @Query(value = "SELECT * FROM beacon_statuses where stage <> 'RESUMED_TRANSMISSION'", nativeQuery = true)
    fun findAllExceptResumedTransmission(): List<BeaconStatusEntity>

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE beacon_statuses SET vessel_status = CAST(:vesselStatus AS beacon_statuses_vessel_status), vessel_status_last_modification_date_utc = :updateDateTime WHERE id = :beaconStatusId", nativeQuery = true)
    fun updateVesselStatus(beaconStatusId: Int, vesselStatus: String, updateDateTime: ZonedDateTime)

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE beacon_statuses SET stage = CAST(:stage AS beacon_statuses_stage), vessel_status_last_modification_date_utc = :updateDateTime WHERE id = :beaconStatusId", nativeQuery = true)
    fun updateStage(beaconStatusId: Int, stage: String, updateDateTime: ZonedDateTime)

    @Query(value = """
        SELECT * FROM beacon_statuses WHERE 
            CASE
                WHEN :vesselIdentifier = 'INTERNAL_REFERENCE_NUMBER' THEN internal_reference_number
                WHEN :vesselIdentifier = 'IRCS' THEN ircs
                WHEN :vesselIdentifier = 'EXTERNAL_REFERENCE_NUMBER' THEN external_reference_number
            END = :value AND malfunction_start_date_utc >= :afterDateTime""", nativeQuery = true)
    fun findAllByVesselIdentifierEqualsAfterDateTime(vesselIdentifier: String, value: String, afterDateTime: Instant): List<BeaconStatusEntity>
}
